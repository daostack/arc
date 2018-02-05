pragma solidity ^0.4.19;


import "../VotingMachines/GenesisProtocolFormulasInterface.sol";
import "../VotingMachines/GenesisProtocol.sol";


contract GenesisProtocolFormulasMock is GenesisProtocolFormulasInterface {

    /**
    * @dev isBoost check if the proposal will shift to the relative voting phase.
    * @param _proposalId the ID of the proposal
    * @return bool true or false.
    */
    function shouldBoost(bytes32 _proposalId) public view returns(bool) {
        address avatar;
        avatar = GenesisProtocol(msg.sender).proposalAvatar(_proposalId);
        int score = int(GenesisProtocol(msg.sender).voteStake(_proposalId,1)) - int(GenesisProtocol(msg.sender).voteStake(_proposalId,0));
        return (score >= threshold(avatar));
    }

    /**
     * @dev score return the proposal score
     * @param _proposalId the ID of the proposal
     * @return uint proposal score.
     */
    function score(bytes32 _proposalId) public view returns (int) {
        uint numOfChoices = GenesisProtocol(msg.sender).getNumberOfChoices(_proposalId);
        if (numOfChoices == 2) {
            return int(GenesisProtocol(msg.sender).voteStake(_proposalId,1)) - int(GenesisProtocol(msg.sender).voteStake(_proposalId,0));
        } else {
            uint totalStakes;
            uint totalVotes;
            uint votersStakes;
            (totalVotes,totalStakes,votersStakes) = GenesisProtocol(msg.sender).proposalStatus(_proposalId);
            uint totalReputationSupply = GenesisProtocol(msg.sender).totalReputationSupply(_proposalId);
            return int(((totalStakes + votersStakes) * (totalVotes**2))/(totalReputationSupply**2));
      }
    }

    /**
     * @dev threshold return the organization's score threshold which required by
     * a proposal to shift to boosted state.
     * This threshold is dynamically set and it depend on the number of boosted proposal.
     * @param _avatar the organization avatar
     * @return int thresholdConstA.
     */
    function threshold(address _avatar) public view returns (int) {
        uint thresholdConstA;
        uint thresholdConstB;
        uint e = 2;
        (thresholdConstA,thresholdConstB) = GenesisProtocol(msg.sender).scoreThresholdParams(_avatar);
        uint orgBoostedProposalsCnt = GenesisProtocol(msg.sender).orgBoostedProposalsCnt(_avatar);
        return int(thresholdConstA * (e ** (orgBoostedProposalsCnt/thresholdConstB)));
    }

    function redeemAmount(bytes32 _proposalId,address _staker) public view returns (uint) {
        uint dummy;
        uint amount;
        uint totalStakes;
        uint winningVote = GenesisProtocol(msg.sender).winningVote(_proposalId);
        uint winningStake = GenesisProtocol(msg.sender).voteStake(_proposalId,winningVote);
        (dummy,amount) = GenesisProtocol(msg.sender).staker(_proposalId,_staker);
        (dummy,totalStakes,dummy) = GenesisProtocol(msg.sender).proposalStatus(_proposalId);
        return (amount * totalStakes) / winningStake;
    }

    function redeemProposerReputation(bytes32 ) public view returns(int) {
        return 0;
    }

    function redeemVoterAmount(bytes32 , address ) public view returns(uint) {
        return 0;
    }
}
