pragma solidity ^0.4.18;


import "../VotingMachines/GovernanceFormulasInterface.sol";
import "../VotingMachines/Governance.sol";


contract GovernanceFormulasMock is GovernanceFormulasInterface {

    /**
    * @dev isBoost check if the proposal will shift to the relative voting phase.
    * @param _proposalId the ID of the proposal
    * @return bool true or false.
    */
    function shouldBoost(bytes32 _proposalId) public view returns(bool) {
        uint totalStakes;
        uint totalVotes;
        address avatar;
        (totalVotes,totalStakes) = Governance(msg.sender).proposalStatus(_proposalId);
        avatar = Governance(msg.sender).proposalAvatar(_proposalId);
        uint totalReputationSupply = Governance(msg.sender).totalReputationSupply(_proposalId);
        uint score = (totalStakes * (totalVotes**2))/(totalReputationSupply**2);
        return (score >= threshold(avatar));
    }

    function score(bytes32 _proposalId) public view returns (uint) {
        uint totalStakes;
        uint totalVotes;
        (totalVotes,totalStakes) = Governance(msg.sender).proposalStatus(_proposalId);
        uint totalReputationSupply = Governance(msg.sender).totalReputationSupply(_proposalId);
        return (totalStakes * (totalVotes**2))/(totalReputationSupply**2);
    }

    function threshold(address _avatar) public view returns (uint) {
        uint initialThreshold = Governance(msg.sender).scoreThreshold(_avatar);
        uint orgBoostedProposalsCnt = Governance(msg.sender).orgBoostedProposalsCnt(_avatar);
        return initialThreshold * (1 + orgBoostedProposalsCnt**2);
    }

    function redeemAmount(bytes32 _proposalId,address _staker) public view returns (uint) {
        uint dummy;
        uint amount;
        uint totalStakes;
        uint winningVote = Governance(msg.sender).winningVote(_proposalId);
        uint winningStake = Governance(msg.sender).voteStake(_proposalId,winningVote);
        (dummy,amount) = Governance(msg.sender).staker(_proposalId,_staker);
        (dummy,totalStakes) = Governance(msg.sender).proposalStatus(_proposalId);
        return (amount * totalStakes) / winningStake;
    }

}
