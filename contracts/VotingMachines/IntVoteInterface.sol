pragma solidity ^0.4.11;

import "../universalSchemes/ExecutableInterface.sol";

contract IntVoteInterface {
  modifier onlyProposalOwner(bytes32 _proposalId) {_;}
  modifier votableProposal(bytes32 _proposalId) {_;}

  function propose(uint _numOfChoices, bytes32 _proposalParameters, address _avatar, ExecutableInterface _executable) returns(bytes32);

  // Only owned proposals and only the owner:
  function cancelProposal(bytes32 _proposalId) onlyProposalOwner(_proposalId) votableProposal(_proposalId) returns(bool);

  // Only owned proposals and only the owner:
  function ownerVote(bytes32 _proposalId, uint _vote, address _voter) onlyProposalOwner(_proposalId) returns(bool);

  function vote(bytes32 _proposalId, uint _vote);

  function voteWithSpecifiedAmounts(bytes32 _proposalId, uint _vote, uint _rep, uint _token) votableProposal(_proposalId);

  function cancelVote(bytes32 _proposalId) votableProposal(_proposalId);

  function executeProposal(bytes32 _proposalId) votableProposal(_proposalId) returns(bool);

  function getNumberOfChoices(bytes32 _proposalId) constant returns(uint);

  function voteInfo(bytes32 _proposalId, address _voter) constant returns(uint[13]);

  function proposalStatus(bytes32 _proposalId) constant returns(uint[13]);
}
