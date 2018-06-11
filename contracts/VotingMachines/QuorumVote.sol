pragma solidity ^0.4.24;

import "../controller/Reputation.sol";
import "./IntVoteInterface.sol";
import "./AbsoluteVote.sol";


contract QuorumVote is IntVoteInterface, AbsoluteVote {
    /**
    * @dev check if the proposal has been decided, and if so, execute the proposal
    * @param _proposalId the id of the proposal
    */
    function execute(bytes32 _proposalId) public votable(_proposalId) returns(bool) {
        Proposal storage proposal = proposals[_proposalId];

        uint totalReputation = parameters[proposal.paramsHash].reputationSystem.totalSupply();
        uint precReq = parameters[proposal.paramsHash].precReq;

        // this is the actual voting rule:
        if (proposal.totalVotes > totalReputation*precReq/100) {
            uint max;
            uint maxInd;
            for (uint cnt = 1; cnt<=proposal.numOfChoices; cnt++) {
                if (proposal.votes[cnt] > max) {
                    max = proposal.votes[cnt];
                    maxInd = cnt;
                }
            }
            Proposal memory tmpProposal = proposal;
            deleteProposal(_proposalId);
            emit ExecuteProposal(_proposalId, maxInd, totalReputation);
            (tmpProposal.executable).execute(_proposalId, tmpProposal.avatar, int(maxInd));
            return true;
        }
        return false;
    }
}
