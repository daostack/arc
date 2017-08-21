pragma solidity ^0.4.11;

import "../universalSchemes/ExecutableInterface.sol";

contract IntVoteInterface {
  modifier onlyOwner(bytes32 _proposalId) {_;}

  function propose(bytes32 _proposalParameters, address _avatar, ExecutableInterface _executable) returns(bytes32);

  // Only owned proposals and only the owner:
  function cancelProposal(bytes32 _proposalId) onlyOwner(_proposalId);

  // Only owned proposals and only the owner:
  function ownerVote(bytes32 _proposalId, int _vote, address _voter) onlyOwner(_proposalId);

  function vote(bytes32 _proposalId, int _vote);

  function cancelVote(uint _proposalId);

  function executeProposal(uint _proposalId) returns(bool);

  function voteInfo(bytes32 _proposalId, address _voter) constant returns(int[10]);

  function proposalStatus(bytes32 _proposalId) constant returns(uint[10]);
}
