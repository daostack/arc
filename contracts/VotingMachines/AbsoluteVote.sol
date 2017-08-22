pragma solidity ^0.4.11;

import "../controller/Reputation.sol";
import "./IntVoteInterface.sol";

// ToDo: write documentation and tests!

contract AbsoluteVote { // is IntVoteInterface
  using SafeMath for uint;

  struct Parameters {
      Reputation reputationSystem;
      uint precReq;
      bool allowOwner;
  }

  struct Voter {
      int vote;
      uint reputation;
  }

  struct Proposal {
      address owner;
      address avatar;
      ExecutableInterface executable;
      bytes32 paramsHash;
      uint yes; // total 'yes' votes
      uint no; // total 'no' votes
      uint abstain; // total 'abstain' votes
      mapping(address=>Voter) voters;
      bool opened; // voting opened flag
      bool executed; // voting was executed flag
  }

  event LogNewProposal(bytes32 indexed _proposalId, address _proposer, bytes32 _paramsHash);
  event LogCancelProposal(bytes32 indexed _proposalId);
  event LogExecuteProposal(bytes32 indexed _proposalId, int _decision);
  event LogVoteProposal(bytes32 indexed _proposalId, address indexed _voter, int _vote, uint _reputation, bool _isOwnerVote);
  event LogCancelVoting(bytes32 indexed _proposalId, address indexed _voter);

  mapping(bytes32=>Parameters) public parameters;  // A mapping from hashes to parameters
  mapping(bytes32=>Proposal) public proposals; // Mapping from the ID of the proposal to the proposal itself.

  uint proposalsCnt;

  modifier onlyOwner(bytes32 _proposalId) {
    require(parameters[proposals[_proposalId].paramsHash].allowOwner);
    require(msg.sender == proposals[_proposalId].owner);
    _;
  }

  modifier votableProposal(bytes32 _proposalId) {
    require(proposals[_proposalId].opened);
    require(! proposals[_proposalId].executed);
    _;
  }

  function AbsoluteVote() {
  }

  /**
   * @dev hash the parameters, save them if necessary, and return the hash value
   */
  function setParameters(Reputation _reputationSystem, uint _precReq, bool _allowOwner) returns(bytes32) {
    require(_precReq <= 100);
    bytes32 hashedParameters = getParametersHash(_reputationSystem, _precReq, _allowOwner);
    parameters[hashedParameters] = Parameters({
      precReq: _precReq,
      reputationSystem: _reputationSystem,
      allowOwner: _allowOwner
    });
    return hashedParameters;
  }

  /**
   * @dev hashParameters returns a hash of the given parameters
   */
  function getParametersHash(Reputation _reputationSystem, uint _precReq, bool _allowOwner) constant returns(bytes32) {
      return sha3(_reputationSystem, _precReq, _allowOwner);
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
    LogNewProposal(proposalId, msg.sender, _paramsHash);
    return proposalId;
  }

  function cancelProposal(bytes32 _proposalId) onlyOwner(_proposalId) {
    delete proposals[_proposalId];
    LogCancelProposal(_proposalId);
  }

  /**
   * @dev Vote for a proposal
   * @param _voter used in case the vote is cast for someone else
   * @return true in case of success
   * throws if proposal is not opened or if it is executed
   * NB: executes the proposal if a decision has been reached
   */
  // TODO: perhaps split in "vote" (without voter argument), and "voteFor" (owner votes for someone else)
  function internalVote(bytes32 _proposalId, int _vote, address _voter) internal votableProposal(_proposalId) {
    Proposal storage proposal = proposals[_proposalId];

    // Check valid vote:
    require(_vote == 1 || _vote == -1 || _vote == 0);

    // If this voter has already voted, first cancel the vote:
    if (proposal.voters[_voter].reputation != 0) {
        cancelVote(_proposalId);
    }

    // The voting itself:
    uint reputation = parameters[proposal.paramsHash].reputationSystem.reputationOf(_voter);
    if (_vote == 1) {
      proposal.yes = reputation.add(proposal.yes);
    }
    if (_vote == -1) {
      proposal.no = reputation.add(proposal.no);
    }
    if (_vote == 0) {
      proposal.abstain = reputation.add(proposal.abstain);
    }
    proposal.voters[_voter] = Voter({
      reputation: reputation,
      vote: _vote
    });

    // Check if ownerVote:
    bool isOwnerVote;
    if (_voter != msg.sender) {
      isOwnerVote = true;
    }

    // Event:
    LogVoteProposal(_proposalId, _voter, _vote, reputation, isOwnerVote);

    // execute the proposal if this vote was decisive:
    executeProposal(_proposalId);
  }

  function vote(bytes32 _proposalId, int _vote) {
    internalVote(_proposalId, _vote, msg.sender);
  }

  function ownerVote(bytes32 _proposalId, int _vote, address _voter) onlyOwner(_proposalId) {
    internalVote(_proposalId, _vote, _voter);
  }

  /**
   * @dev cancel your vote
   * @param _proposalId id of the proposal
   */
  function cancelVote(bytes32 _proposalId) votableProposal(_proposalId) {
    Proposal storage proposal = proposals[_proposalId];

    Voter storage voter = proposal.voters[msg.sender];
    if (voter.vote == 1) {
        proposal.yes = (proposal.yes).sub(voter.reputation);
    }
    if (voter.vote == -1) {
        proposal.no = (proposal.no).sub(voter.reputation);
    }
    if (voter.vote == 0) {
        proposal.abstain = (proposal.abstain).sub(voter.reputation);
    }

    delete proposal.voters[msg.sender];
    LogCancelVoting(_proposalId, msg.sender);
  }

  /**
   * @dev check if the proposal has been decided, and if so, execute the proposal
   * @param _proposalId the id of the proposal
   */
  // TODO: do we want to delete the vote from the proposals mapping?
  function executeProposal(bytes32 _proposalId) votableProposal(_proposalId) returns(bool) {
    Proposal memory proposal = proposals[_proposalId];

    uint totalReputation = parameters[proposal.paramsHash].reputationSystem.totalSupply();
    uint precReq = parameters[proposal.paramsHash].precReq;

    // this is the actual voting rule:
    if (proposal.yes > totalReputation*precReq/100) {
      proposals[_proposalId].executed = true;
      LogExecuteProposal(_proposalId, 1);
      proposal.executable.execute(_proposalId, proposal.avatar, 1);
      return true;
    }
    if (proposal.no > totalReputation*precReq/100) {
      proposals[_proposalId].executed = true;
      LogExecuteProposal(_proposalId, 1);
      proposal.executable.execute(_proposalId, proposal.avatar, -1);
      return true;
    }
    return false;
  }

  /**
   * @dev voteInfo returns the amount of reputation of the user committed to this proposal
   * @param _proposalId the ID of the proposal
   * @param _voter the address of the voter
   * @return amount of reputation committed by _voter to _proposalId
   * a negative value means the user has voted no
   */
  function voteInfo(bytes32 _proposalId, address _voter) constant returns(int[10]) {
    Voter memory voter = proposals[_proposalId].voters[_voter];
    return [voter.vote, int(voter.reputation), 0, 0, 0, 0, 0, 0, 0, 0];
  }

  function proposalStatus(bytes32 _proposalId) constant returns(uint[10]) {
    Proposal memory proposal = proposals[_proposalId];
    uint ended = proposal.executed ? 1 : 0;

    return [proposal.yes, proposal.no, proposal.abstain, ended, 0, 0, 0, 0, 0, 0];
  }
}
