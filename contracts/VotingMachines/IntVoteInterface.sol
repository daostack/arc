pragma solidity ^0.4.18;

import "../universalSchemes/ExecutableInterface.sol";

contract IntVoteInterface {
  modifier onlyProposalOwner(bytes32 _proposalId) {_;}
  modifier votableProposal(bytes32 _proposalId) {_;}

  function propose(uint _numOfChoices, bytes32 _proposalParameters, address _avatar, ExecutableInterface _executable) public returns(bytes32);

  // Only owned proposals and only the owner:
  function cancelProposal(bytes32 _proposalId) public onlyProposalOwner(_proposalId) votableProposal(_proposalId) returns(bool);

  // Only owned proposals and only the owner:
  function ownerVote(bytes32 _proposalId, uint _vote, address _voter) public onlyProposalOwner(_proposalId) returns(bool);

  function vote(bytes32 _proposalId, uint _vote) public;

  function voteWithSpecifiedAmounts(bytes32 _proposalId, uint _vote, uint _rep, uint _token) public votableProposal(_proposalId);

  function cancelVote(bytes32 _proposalId) public votableProposal(_proposalId);

  function executeProposal(bytes32 _proposalId) public votableProposal(_proposalId) returns(bool);

  function getNumberOfChoices(bytes32 _proposalId) public constant returns(uint);

  function voteInfo(bytes32 _proposalId, address _voter) public constant returns(uint[2]);

  function proposalStatus(bytes32 _proposalId) public constant returns(uint[13]);
}
