pragma solidity ^0.4.11;

import "../controller/Controller.sol";
import "../controller/Reputation.sol";

contract UniversalSimpleVote {
    using SafeMath for uint;

    struct ProposalParameters {
      Reputation reputationSystem;
      uint absPrecReq; // Usually >= 50
    }

    struct Proposal {
        address owner;
        bytes32 parameters;
        uint yes; // total 'yes' votes
        uint no; // total 'no' votes
        mapping(address=>bool) voted; // people in this list have already voted
        bool opened; // A flag that voting opened
        bool ended; // voting had ended flag
    }

    event NewProposal( bytes32 _proposalId, address owner, Reputation _reputationSystem, uint absPrecReq);
    event VoteProposal( address _voter, bytes32 _proposalId, bool _yes, uint _reputation );
    event EndProposal( bytes32 _proposalId );
    event CancelProposal(bytes32 _proposalId);

    mapping(bytes32=>ProposalParameters) proposalsParameters;
    mapping(bytes32=>Proposal) proposals;

    function UniversalSimpleVote() {
    }

    function setParameters(Reputation _reputationSystem, uint _absPrecReq) returns(bytes32) {
      require(_absPrecReq <= 100);
      bytes32 hashedParameters = hashParameters(_reputationSystem, _absPrecReq);
      proposalsParameters[hashedParameters].absPrecReq = _absPrecReq;
      proposalsParameters[hashedParameters].reputationSystem = _reputationSystem;
      return hashedParameters;
    }

    /**
     * @dev hashParameters returns a hash of the given parameters
     */
    function hashParameters(Reputation _reputationSystem, uint _absPrecReq) constant returns(bytes32) {
      return sha3(_reputationSystem, _absPrecReq);
    }

    function checkExistingParameters(bytes32 _proposalParameters) constant returns(bool) {
      if (proposalsParameters[_proposalParameters].reputationSystem != address(0))
        return true;
      return false;
    }

    /**
     * @dev register a new proposal with the given parameters.
     * @param _proposalParameters defined the parameters of the voting machine used for this proposal
     * NB: the parameters need to be first reigstered in the proposalsParameters mapping using setParameters
     */
   function propose(bytes32 _proposalParameters) returns(bytes32) {
      // Do we want to make sure that proposing a proposal will be done only by registered schemes?
      require(checkExistingParameters(_proposalParameters));
      Proposal memory proposal;
      bytes32 id;
      proposal.parameters = _proposalParameters;
      proposal.owner = msg.sender;
      proposal.opened = true;
      id = sha3(msg.sender, _proposalParameters);
      // this basically gives a arbitrary id.
      while (proposals[id].opened)
        id = sha3(id^sha3(id));
      proposals[id] = proposal;
      NewProposal(id, msg.sender, proposalsParameters[_proposalParameters].reputationSystem, proposalsParameters[_proposalParameters].absPrecReq);
      return id;
    }

    function cancelProposal(bytes32 id) returns(bool) {
        require(msg.sender == proposals[id].owner);
        delete proposals[id];
        CancelProposal(id);
        return true;
    }

    function vote(bytes32 id, bool yes, address voter) returns(bool) {
        Proposal proposal = proposals[id];
        require(proposal.opened);
        require(! proposal.ended);
        require(msg.sender == proposal.owner);

        if( proposal.voted[voter] ) return false;

        uint reputation = proposalsParameters[proposal.parameters].reputationSystem.reputationOf(voter);
        uint totalReputation = proposalsParameters[proposal.parameters].reputationSystem.totalSupply();
        uint absPrecReq = proposalsParameters[proposal.parameters].absPrecReq;

        if (yes) {
            proposal.yes = reputation.add(proposal.yes);
        } else {
            proposal.no = reputation.add(proposal.no);
        }
        VoteProposal(voter, id, yes, reputation);

        // this is the actual voting rule:
        if( (proposal.yes > totalReputation*absPrecReq/100) || (proposal.no > totalReputation*absPrecReq/100 ) ) {
            proposal.ended = true;
            EndProposal(id);
        }
        return true;
    }

    // returns result of the proposal:
    //      true if the proposal passed
    //      false if the proposal has not passed (yet)
    function voteResults(bytes32 id) constant returns(bool) {
        Proposal proposal = proposals[id];

        if (proposal.ended && (proposal.yes > proposal.no)) {
            return true;
        } else {
            return false;
        }
    }

    function voteStatus(bytes32 id) constant returns(uint[3]) {
        uint yes = proposals[id].yes;
        uint no = proposals[id].no;
        uint ended = proposals[id].ended ? 1 : 0;

        return [yes, no, ended];
    }
}
