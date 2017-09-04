pragma solidity ^0.4.11;

import "../controller/Reputation.sol";
import "./IntVoteInterface.sol";
import "../universalSchemes/UniversalScheme.sol";

// ToDo: Write tests!

contract EmergentVoteScheme is IntVoteInterface, UniversalScheme {
  using SafeMath for uint;

  struct Organization {
      bool isRegistered;
      uint boostedProposals;
      bytes32[] awaitingBoostProposals;
  }

  struct OrgParameters {
    Reputation reputationSystem; // the reputation system that is being used
    StandardToken boostToken;
    address beneficiary;
    uint attentionBandwidth;
    uint minBoostTimeFrame;
    uint maxBoostTimeFrame;
    uint minBoost;
    bool allowOwner; // does this porposal has a owner who has owner rights?
  }

  struct ProposalParameters {
    uint precReq; // how many precentages are required for the porpsal to be passed
    uint numOfChoices;
    uint qourum;
    uint boostTimeFrame;
  }

  struct Voter {
    uint vote; // 0 - 'abstain'
    uint reputation; // amount of voter's reputation
  }

  struct Proposal {
    address owner; // the porposal's owner
    address avatar; // the avatar of the organization that owns the porposal
    ExecutableInterface executable; // will be executed if the perposal will pass
    bytes32 paramsHash; // the hash of the parameters of the porposal
    uint totalVotes;
    mapping(uint=>uint) votes;
    mapping(address=>Voter) voters;
    bool opened; // voting opened flag
    bool isBoostModeActive;
    bool isAwaitingBoost;
    uint closingTime;
    uint boostedFunds;
  }

  event LogNewProposal(bytes32 indexed _proposalId, address _proposer, bytes32 _paramsHash);
  event LogCancelProposal(bytes32 indexed _proposalId);
  event LogExecuteProposal(bytes32 indexed _proposalId, uint _decision);
  event LogVoteProposal(bytes32 indexed _proposalId, address indexed _voter, uint _vote, uint _reputation, bool _isOwnerVote);
  event LogCancelVoting(bytes32 indexed _proposalId, address indexed _voter);

  mapping(address=>Organization) public organizations;
  mapping(bytes32=>OrgParameters) public organizationsParameters;
  mapping(bytes32=>ProposalParameters) public proposalsParameters;  // A mapping from hashes to parameters
  mapping(bytes32=>Proposal) public proposals; // Mapping from the ID of the proposal to the proposal itself.

  uint constant public maxNumOfChoices = 10;
  uint proposalsCnt; // Total amount of porposals

  /**
   * @dev Check that there is owner for the porposal and he sent the transaction
   */
  modifier onlyProposalOwner(bytes32 _proposalId) {
    require(msg.sender == proposals[_proposalId].owner);
    _;
  }

  /**
   * @dev Check that the porposal is votable (opened and not executed yet)
   */
  modifier votableProposal(bytes32 _proposalId) {
    require(proposals[_proposalId].opened);
    _;
  }

  function EmergentVoteScheme(StandardToken _nativeToken, uint _fee, address _beneficiary) {
    updateParameters(_nativeToken, _fee, _beneficiary, bytes32(0));
  }

  /**
   * @dev hash the parameters, save them if necessary, and return the hash value
   */
  function setOrgParameters(
    Reputation _reputationSystem,
    StandardToken _boostToken,
    address _beneficiary,
    uint _attentionBandwidth,
    uint _minBoostTimeFrame,
    uint _maxBoostTimeFrame,
    uint _minBoost,
    bool _allowOwner
  ) returns(bytes32)
  {
    bytes32 paramsHash = getOrgParametersHash(
      _reputationSystem,
      _boostToken,
      _beneficiary,
      _attentionBandwidth,
      _minBoostTimeFrame,
      _maxBoostTimeFrame,
      _minBoost,
      _allowOwner
    );
    organizationsParameters[paramsHash] = OrgParameters({
      reputationSystem: _reputationSystem,
      boostToken: _boostToken,
      beneficiary: _beneficiary,
      attentionBandwidth: _attentionBandwidth,
      minBoostTimeFrame: _minBoostTimeFrame,
      maxBoostTimeFrame: _maxBoostTimeFrame,
      minBoost: _minBoost,
      allowOwner: _allowOwner
    });
    return paramsHash;
  }

  function getOrgParametersHash(
    Reputation _reputationSystem,
    StandardToken _boostToken,
    address _beneficiary,
    uint _attentionBandwidth,
    uint _minBoostTimeFrame,
    uint _maxBoostTimeFrame,
    uint _minBoost,
    bool _allowOwner
  ) constant returns(bytes32)
  {
    bytes32 paramsHash = sha3(
      _reputationSystem,
      _boostToken,
      _beneficiary,
      _attentionBandwidth,
      _minBoostTimeFrame,
      _maxBoostTimeFrame,
      _minBoost,
      _allowOwner
    );
    return paramsHash;
  }

  /**
   * @dev hash the parameters, save them if necessary, and return the hash value
   */
  function setProposalParameters(uint _precReq, uint _numOfChoices, uint _qourum, uint _boostTimeFrame) returns(bytes32) {
    require(_precReq <= 100 && _precReq > 0);
    require(_numOfChoices > 0 && _numOfChoices <= maxNumOfChoices);
    bytes32 hashedParameters = getProposalParametersHash(_precReq, _numOfChoices, _qourum, _boostTimeFrame);
    proposalsParameters[hashedParameters] = ProposalParameters({
      precReq: _precReq,
      numOfChoices: _numOfChoices,
      qourum: _qourum,
      boostTimeFrame: _boostTimeFrame
    });
    return hashedParameters;
  }

  /**
   * @dev hashParameters returns a hash of the given parameters
   */
  function getProposalParametersHash(uint _precReq, uint _numOfChoices, uint _qourum, uint _boostTimeFrame) constant returns(bytes32) {
    return sha3(_precReq, _numOfChoices, _qourum, _boostTimeFrame);
  }

  /**
   * @dev register a new proposal with the given parameters. Every porposal has a unique ID which is being
   * generated by calculating sha3 of a incremented counter.
   * @param _paramsHash defined the parameters of the voting machine used for this proposal
   * @param _avatar an address to be sent as the payload to the _executable contract.
   * @param _executable This contract will be executed when vote is over.
   */
  function propose(bytes32 _paramsHash, address _avatar, ExecutableInterface _executable) returns(bytes32) {
    // ToDo: check parameters are OK:

    // Check org is registered:
    require(organizations[_avatar].isRegistered);

    // Check params exist:
    require(proposalsParameters[_paramsHash].precReq != 0);

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

  /**
   * @dev Cancel a porposal, only the owner can call this function and only if allowOwner flag is true.
   * @param _proposalId the porposal ID
   */
  function cancelProposal(bytes32 _proposalId) onlyProposalOwner(_proposalId) votableProposal(_proposalId) returns(bool){
    address avatar = proposals[_proposalId].avatar;
    bytes32 paramsHash = getParametersFromController(Avatar(avatar));
    if (! organizationsParameters[paramsHash].allowOwner) {
      return false;
    }

    // Check if on the awaiting list, if so, delete it:
    bool isFound;
    uint index;
    (isFound, index) = findInArray(organizations[avatar].awaitingBoostProposals, _proposalId);
    if (isFound) {
      deleteFromArray(organizations[avatar].awaitingBoostProposals, index);
    }

    delete proposals[_proposalId];
    LogCancelProposal(_proposalId);
    return true;
  }

  function proposalScore(bytes32 _proposalId) constant returns(uint) {
    Proposal proposal = proposals[_proposalId];
    return (proposal.boostedFunds.mul(proposal.totalVotes));
  }

  function findMinScore(bytes32[] _idsArray) constant returns(uint index, uint min) {
    for (uint cnt=0; cnt<_idsArray.length; cnt++) {
      if (proposalScore(_idsArray[cnt]) < min) {
        index = cnt;
        min = proposalScore(_idsArray[cnt]);
      }
    }
  }

  function findMaxScore(bytes32[] _idsArray) constant returns(uint index, uint max) {
    for (uint cnt=0; cnt<_idsArray.length; cnt++) {
      if (proposalScore(_idsArray[cnt]) > max) {
        index = cnt;
        max = proposalScore(_idsArray[cnt]);
      }
    }
  }

  function findInArray(bytes32[] _idsArray, bytes32 _id) constant returns(bool isFound, uint index) {
    for (uint cnt=0; cnt<_idsArray.length; cnt++) {
      if (_idsArray[cnt] == _id) {
        return(true, cnt);
      }
    }
  }

  function tryAwaitingBoostProposals(bytes32 _proposalId) internal {
    // Retrieve org and parameters hash:
    address avatar = proposals[_proposalId].avatar;
    require(avatar != address(0)); // Check propsal exists
    bytes32 orgParamsHash = getParametersFromController(Avatar(avatar));
    OrgParameters memory orgParams = organizationsParameters[orgParamsHash];
    Organization org = organizations[avatar];

    // If proposal already awaiting, return:
    if (proposals[_proposalId].isAwaitingBoost) {
      return;
    }

    // If there is room just add proposal:
    uint maxAwaitingList = 2*orgParams.attentionBandwidth;
    if (org.awaitingBoostProposals.length < maxAwaitingList) {
      org.awaitingBoostProposals.push(_proposalId);
      proposals[_proposalId].isAwaitingBoost = true;
      return;
    }

    // Find minimum, if lower than current, replace:
    uint minIndex;
    uint minScore;
    (minIndex, minScore) = findMinScore(org.awaitingBoostProposals);
    if(proposalScore(_proposalId) > minIndex) {
      proposals[org.awaitingBoostProposals[minIndex]].isAwaitingBoost = false;
      proposals[_proposalId].isAwaitingBoost = true;
      org.awaitingBoostProposals[minIndex] = _proposalId;
    }
  }

  function boostProposal(bytes32 _proposalId, uint _boostValue) internal {
    // Check proposal is not already in boost mode:
    if (proposals[_proposalId].isBoostModeActive) {
      return;
    }

    // Retrieve org and parameters hash:
    address avatar = proposals[_proposalId].avatar;
    require(avatar != address(0)); // Check propsal exists
    bytes32 orgParamsHash = getParametersFromController(Avatar(avatar));
    OrgParameters memory orgParams = organizationsParameters[orgParamsHash];

    // Collect boosting fee and add value to boosted funds:
    assert(_boostValue > orgParams.minBoost);
    orgParams.boostToken.transferFrom(msg.sender, orgParams.beneficiary, _boostValue); // ToDo: Move to end?
    proposals[_proposalId].boostedFunds = proposals[_proposalId].boostedFunds.add(_boostValue);

    // If proposal is not in awaiting list, try to add:
    if (proposals[_proposalId].isAwaitingBoost) {
      tryAwaitingBoostProposals(_proposalId);
    }
  }

  function deleteFromArray(bytes32[] storage _idsArray, uint _index) internal {
    assert(_idsArray.length > _index);
    for (uint cnt=_index; cnt<_idsArray.length-1; cnt++) {
      _idsArray[cnt] = _idsArray[cnt+1];
    }
    _idsArray.length--;
  }

  function moveTopAwaitingBoostMode(address _avatar) {
    // Retrieve org and parameters hash:
    require(_avatar != address(0)); // Check propsal exists
    bytes32 orgParamsHash = getParametersFromController(Avatar(_avatar));
    OrgParameters memory orgParams = organizationsParameters[orgParamsHash];
    Organization org = organizations[_avatar];

    // Check we have free bandwidth:
    if (org.boostedProposals >= orgParams.attentionBandwidth) {
      return;
    }

    // Check awaiting list is not empty:
    if (org.awaitingBoostProposals.length == 0) {
      return;
    }

    // Find maximum and add it:
    org.boostedProposals++;
    uint maxIndex;
    (maxIndex, ) = findMaxScore(org.awaitingBoostProposals);
    Proposal proposal =  proposals[org.awaitingBoostProposals[maxIndex]];
    proposal.isBoostModeActive = true;
    proposal.isAwaitingBoost = false;
    uint timeFrame = proposalsParameters[proposal.paramsHash].boostTimeFrame;
    proposal.closingTime = block.number.add(timeFrame);

    // Shift array:
    deleteFromArray(org.awaitingBoostProposals, maxIndex);
  }

  /**
   * @dev Vote for a proposal, if the voter already voted, cancel the last vote and set a new one instead
   * @param _proposalId id of the proposal
   * @param _vote yes (1) / no (-1) / abstain (0)
   * @param _voter used in case the vote is cast for someone else
   * @return true in case of success
   * throws if proposal is not opened or if it is executed
   * NB: executes the proposal if a decision has been reached
   */
  function internalVote(bytes32 _proposalId, uint _vote, address _voter, uint _rep) internal votableProposal(_proposalId) {
    Proposal storage proposal = proposals[_proposalId];
    ProposalParameters memory params = proposalsParameters[proposal.paramsHash];
    bytes32 paramsHash = getParametersFromController(Avatar(proposal.avatar));
    OrgParameters memory orgParams = organizationsParameters[paramsHash];

    // If boosted proposal and ended, exectute:
    if (proposal.isBoostModeActive && block.number >= proposal.closingTime) {
      executeProposal(_proposalId);
      return;
    }

    // Check valid vote:
    require(_vote <= params.numOfChoices);

    // Check voter has enough reputation:
    uint reputation = orgParams.reputationSystem.reputationOf(_voter);
    require(reputation >= _rep);
    if (_rep == 0) {
      _rep = reputation;
    }

    // If this voter has already voted, first cancel the vote:
    if (proposal.voters[_voter].reputation != 0) {
        cancelVoteInternal(_proposalId, _voter);
    }

    // The voting itself:
    proposal.votes[_vote] = _rep.add(proposal.votes[_vote]);
    proposal.totalVotes = _rep.add(proposal.totalVotes);
    proposal.voters[_voter] = Voter({
      reputation: _rep,
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

  /**
   * @dev voting function
   * @param _proposalId id of the proposal
   * @param _vote yes (1) / no (-1) / abstain (0)
   */
  function vote(bytes32 _proposalId, uint _vote) {
    internalVote(_proposalId, _vote, msg.sender, 0);
  }

  function voteWithSpecifiedAmounts(bytes32 _proposalId, uint _vote, uint _rep, uint) votableProposal(_proposalId) {
    internalVote(_proposalId, _vote, msg.sender, _rep);
  }

  /**
   * @dev voting function with owner functionality (can vote on behalf of someone else)
   * @param _proposalId id of the proposal
   * @param _vote yes (1) / no (-1) / abstain (0)
   * @param _voter will be voted with that voter's address
   */
  function ownerVote(bytes32 _proposalId, uint _vote, address _voter) onlyProposalOwner(_proposalId) returns(bool) {
    bytes32 paramsHash = getParametersFromController(Avatar(proposals[_proposalId].avatar));
    if (! organizationsParameters[paramsHash].allowOwner) {
      return;
    }

    internalVote(_proposalId, _vote, _voter, 0);
    return true;
  }

  /**
   * @dev Cancel the vote of the msg.sender: subtract the reputation amount from the votes
   * and delete the voter from the porposal struct
   * @param _proposalId id of the proposal
   */
  function cancelVote(bytes32 _proposalId) votableProposal(_proposalId) {
    cancelVoteInternal(_proposalId, msg.sender);
  }

  function cancelVoteInternal(bytes32 _proposalId, address _voter) internal {
    Proposal storage proposal = proposals[_proposalId];
    Voter memory voter = proposal.voters[_voter];

    proposal.votes[voter.vote] = (proposal.votes[voter.vote]).sub(voter.reputation);
    proposal.totalVotes = (proposal.totalVotes).sub(voter.reputation);

    delete proposal.voters[_voter];
    LogCancelVoting(_proposalId, _voter);
  }

  /**
   * @dev check if the proposal has been decided, and if so, execute the proposal
   * @param _proposalId the id of the proposal
   * @return bool is the porposal has been executed or not?
   */
  // TODO: do we want to delete the vote from the proposals mapping?
  function executeProposal(bytes32 _proposalId) votableProposal(_proposalId) returns(bool) {
    Proposal storage proposal = proposals[_proposalId];

    bytes32 orgParamsHash = getParametersFromController(Avatar(proposal.avatar));
    uint totalReputation = organizationsParameters[orgParamsHash].reputationSystem.totalSupply();
    uint precReq = proposalsParameters[proposal.paramsHash].precReq;
    Proposal memory tmpProposal = proposal;

    // Check boosted propsals:
    if (proposal.isBoostModeActive && block.number >= proposal.closingTime) {
      uint qourum = proposalsParameters[proposal.paramsHash].qourum;
      if (proposal.totalVotes/totalReputation >= qourum) {
        uint max;
        uint maxInd;
        for (uint cnt=1; cnt<=proposalsParameters[proposal.paramsHash].numOfChoices; cnt++) {
          if (proposal.votes[cnt] > max) {
            max = proposal.votes[cnt];
            maxInd = cnt;
          }
        }
        delete proposals[_proposalId];
        LogExecuteProposal(_proposalId, maxInd);
        (tmpProposal.executable).execute(_proposalId, tmpProposal.avatar, int(maxInd));
        return true;
      }
    }

    // Check if someone crossed the bar:
    for (uint cnt2=0; cnt2<=proposalsParameters[proposal.paramsHash].numOfChoices; cnt2++) {
      if (proposal.votes[cnt2] > totalReputation*precReq/100) {
        delete proposals[_proposalId];
        LogExecuteProposal(_proposalId, cnt);
        (tmpProposal.executable).execute(_proposalId, tmpProposal.avatar, int(cnt2));
        return true;
      }
    }
    return false;
  }

  /**
   * @dev voteInfo returns the vote and the amount of reputation of the user committed to this proposal
   * @param _proposalId the ID of the proposal
   * @param _voter the address of the voter
   * @return int[10] array that contains the vote's info:
   * amount of reputation committed by _voter to _proposalId, and the voters vote (1/-1/-0)
   */
  function voteInfo(bytes32 _proposalId, address _voter) constant returns(uint[13]) {
    Voter memory voter = proposals[_proposalId].voters[_voter];
    return [voter.vote, voter.reputation, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }

  /**
   * @dev proposalStatus returns the number of yes, no, and abstain and if the porposal is ended of a given porposal id
   * @param _proposalId the ID of the proposal
   * @return int[10] array that contains the porposal's info:
   * number of yes, no, and abstain, and if the voting for the porposal has ended
   */
  function proposalStatus(bytes32 _proposalId) constant returns(uint[13]) {
    Proposal storage proposal = proposals[_proposalId];
    uint opened = proposal.opened ? 1 : 0;
    uint[13] memory returnedArray;
    returnedArray[12] = opened;
    for (uint cnt=0; cnt<=proposalsParameters[proposal.paramsHash].numOfChoices; cnt++) {
      returnedArray[cnt] = proposal.votes[cnt];
    }
    return returnedArray;
  }
}
