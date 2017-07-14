pragma solidity ^0.4.11;

import "../controller/Reputation.sol";
import "../universalSchemes/ExecutableInterface.sol";

contract SimpleVote {
    using SafeMath for uint;

    struct Parameters {
      Reputation reputationSystem;
      uint absPrecReq; // Usually >= 50
    }

    struct Proposal {
        address owner;
        address avatar;
        ExecutableInterface executable;
        bytes32 paramsHash;
        uint yes; // total 'yes' votes
        uint no; // total 'no' votes
        mapping(address=>int) voted; // save the amount of reputation voted by an agent (positive sign is yes, negatice is no)
        bool opened; // voting opened flag
        bool ended; // voting had ended flag
    }

    uint proposalsCnt;

    event NewProposal( bytes32 _proposalId, address _owner, bytes32 _paramsHash);
    event CancelProposal(bytes32 _proposalId);
    event EndProposal( bytes32 _proposalId, bool _yes );
    event VoteProposal( address _voter, bytes32 _proposalId, bool _yes, uint _reputation);
    event CancelVoting(address _voter, bytes32 _proposalId);

    mapping(bytes32=>Parameters) parameters;  // A mapping from hashes to parameters
    mapping(bytes32=>Proposal) proposals; // Mapping from the ID of the proposal to the proposal itself.

    function UniversalSimpleVote() {
    }

    /**
     * @dev hash the parameters, save them if necessary, and return the hash value
     */
    function setParameters(Reputation _reputationSystem, uint _absPrecReq) returns(bytes32) {
      require(_absPrecReq <= 100);
      bytes32 hashedParameters = getParametersHash(_reputationSystem, _absPrecReq);
      parameters[hashedParameters].absPrecReq = _absPrecReq;
      parameters[hashedParameters].reputationSystem = _reputationSystem;
      return hashedParameters;
    }

    /**
     * @dev hashParameters returns a hash of the given parameters
     */
    function getParametersHash(Reputation _reputationSystem, uint _absPrecReq) constant returns(bytes32) {
        return sha3(_reputationSystem, _absPrecReq);
    }

    /**
     * @dev register a new proposal with the given parameters.
     * @param _paramsHash defined the parameters of the voting machine used for this proposal
     * @param _avatar an address to be sent on execuation.
     * @param _executable This contract will be executed when vote is over.
     */
   function propose(bytes32 _paramsHash, address _avatar, ExecutableInterface _executable) returns(bytes32) {
        // Check params exist:
        require(parameters[_paramsHash].reputationSystem != address(0));

        // Generate a unique ID:
        bytes32 id = sha3(this, proposalsCnt);
        proposalsCnt++;

        // Open proposal:
        Proposal memory proposal;
        proposal.paramsHash = _paramsHash;
        proposal.avatar = _avatar;
        proposal.executable = _executable;
        proposal.owner = msg.sender;
        proposal.opened = true;
        proposals[id] = proposal;
        NewProposal(id, msg.sender, _paramsHash);
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
        require(proposal.opened); // Check the proposal exists
        require(!proposal.ended); // Check the voting is not finished

        // The owner of the vote can vote in anyones name. Others can only vote for themselves.
        if (msg.sender != proposal.owner)
          voter = msg.sender;

        if( proposal.voted[voter] != 0 ) return false;

        uint reputation = parameters[proposal.paramsHash].reputationSystem.reputationOf(voter);

        if (yes) {
            proposal.yes = reputation.add(proposal.yes);
            proposal.voted[voter] = int(reputation);
        } else {
            proposal.no = reputation.add(proposal.no);
            proposal.voted[voter] = (-1)*int(reputation);
        }
        VoteProposal(voter, id, yes, reputation);
        checkVoteEnded(id);
        return true;
    }

    function cancelVoting(bytes32 id) {
      Proposal proposal = proposals[id];
      // Check vote is open:
      require(proposal.opened);
      require(! proposal.ended);

      int vote = proposal.voted[msg.sender];
      if (vote > 0)
        proposal.yes = (proposal.yes).sub(uint(vote));
      else
        proposal.yes = (proposal.no).sub(uint((-1)*vote));
      proposal.voted[msg.sender] = 0;
      CancelVoting(msg.sender, id);
    }

    function checkVoteEnded(bytes32 id) returns(bool) {
      Proposal proposal = proposals[id];
      require(! proposal.ended);
      uint totalReputation = parameters[proposal.paramsHash].reputationSystem.totalSupply();
      uint absPrecReq = parameters[proposal.paramsHash].absPrecReq;
      // this is the actual voting rule:
      if( (proposal.yes > totalReputation*absPrecReq/100) || (proposal.no > totalReputation*absPrecReq/100 ) ) {
          proposal.ended = true;
          if (proposal.yes > proposal.no) {
            proposal.executable.execute(id, proposal.avatar, 1);
            EndProposal(id, true);
          }
          else {
            proposal.executable.execute(id, proposal.avatar, 0);
            EndProposal(id, false);
          }
          return true;
      }
      return false;
    }

    function voteStatus(bytes32 id) constant returns(uint[3]) {
        uint yes = proposals[id].yes;
        uint no = proposals[id].no;
        uint ended = proposals[id].ended ? 1 : 0;

        return [yes, no, ended];
    }
}
