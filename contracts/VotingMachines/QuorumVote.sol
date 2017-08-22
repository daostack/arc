pragma solidity ^0.4.11;

import "../controller/Reputation.sol";
import "./IntVoteInterface.sol";
import "./AbsoluteVote.sol";

contract QuorumVote is IntVoteInterface, AbsoluteVote {
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
    uint totalVoters = proposal.yes + proposal.no + proposal.abstain;
    if (totalVoters > totalReputation*precReq/100) {
      if (proposal.yes > proposal.no) {
        proposals[_proposalId].executed = true;
        LogExecuteProposal(_proposalId, 1);
        proposal.executable.execute(_proposalId, proposal.avatar, 1);
        return true;
      }
      if (proposal.no > proposal.yes) {
        proposals[_proposalId].executed = true;
        LogExecuteProposal(_proposalId, -1);
        proposal.executable.execute(_proposalId, proposal.avatar, -1);
        return true;
      }
    }
    return false;
  }

}
