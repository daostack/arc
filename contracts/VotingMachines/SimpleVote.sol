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

    mapping(bytes32=>Parameters) public parameters;  // A mapping from hashes to parameters
    mapping(bytes32=>Proposal) public proposals; // Mapping from the ID of the proposal to the proposal itself.

    function SimpleVote() {
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
     * @param _avatar an address to be sent as the payload to the _executable contract.
     * @param _executable This contract will be executed when vote is over.
     */
   function propose(bytes32 _paramsHash, address _avatar, ExecutableInterface _executable) returns(bytes32) {
        // Check params exist:
        require(parameters[_paramsHash].reputationSystem != address(0));

        // Generate a unique ID:
        bytes32 proposalId = sha3(this, proposalsCnt);
        proposalsCnt++;

        // Open proposal:
        Proposal memory proposal;
        proposal.paramsHash = _paramsHash;
        proposal.avatar = _avatar;
        proposal.executable = _executable;
        proposal.owner = msg.sender;
        proposal.opened = true;
        proposals[proposalId] = proposal;
        NewProposal(proposalId, msg.sender, _paramsHash);
        return proposalId;
    }

    function cancelProposal(bytes32 proposalId) returns(bool) {
        require(msg.sender == proposals[proposalId].owner);
        delete proposals[proposalId];
        CancelProposal(proposalId);
        return true;
    }

    /**
     * @dev Vote for a proposal
     * @param _voter used in case the vote is cast for someone else
     * @return true in case of success
     * throws if proposal is not opened or if it is ended
     * NB: executes the proposal if a decision has been reached
     */
    // TODO: perhaps split in "vote" (without voter argument), and "voteFor" (owner votes for someone else)
    function vote(bytes32 _proposalId, bool _yes, address _voter) returns(bool) {
        Proposal storage proposal = proposals[_proposalId];

        require(proposal.opened); // Check the proposal exists
        require(!proposal.ended); // Check the voting is not finished

        // The owner of the vote can vote in anyones name. Others can only vote for themselves.
        if (msg.sender != proposal.owner) {
            _voter = msg.sender;
        }

        // if this voter has already voted for the proposal, just ignore
        if (proposal.voted[_voter] != 0) {
            return false;
        }

        uint reputation = parameters[proposal.paramsHash].reputationSystem.reputationOf(_voter);

        if (_yes) {
            proposal.yes = reputation.add(proposal.yes);
            proposal.voted[_voter] = int(reputation);
        } else {
            proposal.no = reputation.add(proposal.no);
            proposal.voted[_voter] = (-1)*int(reputation);
        }
        VoteProposal(_voter, _proposalId, _yes, reputation);
        // execute the proposal if this vote was decisive:
        executeProposal(_proposalId);
        return true;
    }

    /**
     * @dev cancel your vote
     * @param _proposalId id of the proposal
     */
    function cancelVote(bytes32 _proposalId) {
        Proposal storage proposal = proposals[_proposalId];
        // Check vote is open:
        require(proposal.opened);
        require(!proposal.ended);

        int vote = proposal.voted[msg.sender];

        if (vote > 0) {
            proposal.yes = (proposal.yes).sub(uint(vote));
        } else {
            proposal.yes = (proposal.no).sub(uint((-1)*vote));
        }
        proposal.voted[msg.sender] = 0;
        CancelVoting(msg.sender, _proposalId);
    }

    /**
     * @dev check if the proposal has been decided, and if so, execute the proposal
     * @param _proposalId the id of the proposal
     */
    // TODO: do we want to delete the vote from the proposals mapping?
    function executeProposal(bytes32 _proposalId) returns(bool) {
        Proposal memory proposal = proposals[_proposalId];

        require(!proposal.ended);

        uint totalReputation = parameters[proposal.paramsHash].reputationSystem.totalSupply();
        uint absPrecReq = parameters[proposal.paramsHash].absPrecReq;

        // this is the actual voting rule:
        if( (proposal.yes > (totalReputation*absPrecReq/100)) || (proposal.no > (totalReputation*absPrecReq/100))) {
            proposal.ended = true;
            proposals[_proposalId] = proposal;
            if (proposal.yes > proposal.no) {
                proposal.executable.execute(_proposalId, proposal.avatar, 1);
                EndProposal(_proposalId, true);
            } else {
                proposal.executable.execute(_proposalId, proposal.avatar, 0);
                EndProposal(_proposalId, false);
            }
            return true;
        }
        return false;
    }

    function voteStatus(bytes32 _proposalId) constant returns(uint[3]) {
        uint yes = proposals[_proposalId].yes;
        uint no = proposals[_proposalId].no;
        uint ended = proposals[_proposalId].ended ? 1 : 0;

        return [yes, no, ended];
    }

    /**
     * @dev voteInfo returns the amount of reputation of the user committed to this proposal
     * @param _proposalId the ID of the proposal
     * @param _voter the address of the voter
     * @return amount of reputation committed by _voter to _proposalId
     * a negative value means the user has voted no
     */
    function voteInfo(bytes32 _proposalId, address _voter) constant returns(int) {
        return proposals[_proposalId].voted[_voter];
    }
}
