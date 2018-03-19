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
        int score = int(GenesisProtocol(msg.sender).voteStake(_proposalId,GenesisProtocol(msg.sender).YES())) - int(GenesisProtocol(msg.sender).voteStake(_proposalId,GenesisProtocol(msg.sender).NO()));
        return (score >= threshold(_proposalId,avatar));
    }

    /**
     * @dev score return the proposal score
     * @param _proposalId the ID of the proposal
     * @return uint proposal score.
     */
    function score(bytes32 _proposalId) public view returns (int) {
        return int(GenesisProtocol(msg.sender).voteStake(_proposalId,GenesisProtocol(msg.sender).YES())) - int(GenesisProtocol(msg.sender).voteStake(_proposalId,GenesisProtocol(msg.sender).NO()));
    }

    /**
     * @dev threshold return the organization's score threshold which required by
     * a proposal to shift to boosted state.
     * This threshold is dynamically set and it depend on the number of boosted proposal.
     * @param _avatar the organization avatar
     * @return int thresholdConstA.
     */
    function threshold(bytes32 ,address _avatar) public view returns (int) {
        uint thresholdConstA;
        uint thresholdConstB;
        uint e = 2;
        (thresholdConstA,thresholdConstB) = GenesisProtocol(msg.sender).scoreThresholdParams(_avatar);
        uint orgBoostedProposalsCnt = GenesisProtocol(msg.sender).orgBoostedProposalsCnt(_avatar);
        return int(thresholdConstA * (e ** (orgBoostedProposalsCnt/thresholdConstB)));
    }

    function getRedeemableTokensStaker(bytes32 _proposalId,address _staker) public view returns (uint) {
        uint dummy;
        uint amount;
        uint totalStakes;
        uint winningVote = GenesisProtocol(msg.sender).winningVote(_proposalId);
        uint winningStake = GenesisProtocol(msg.sender).voteStake(_proposalId,winningVote);
        (dummy,amount) = GenesisProtocol(msg.sender).staker(_proposalId,_staker);
        (dummy,totalStakes,dummy,dummy) = GenesisProtocol(msg.sender).proposalStatus(_proposalId);
        return (amount * totalStakes) / winningStake;
    }

    function getRedeemableReputationProposer(bytes32 ) public view returns(int) {
        return 0;
    }

    function getRedeemableTokensVoter(bytes32 , address ) public view returns(uint) {
        return 0;
    }
}
