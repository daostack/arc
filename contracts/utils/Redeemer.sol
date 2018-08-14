pragma solidity ^0.4.24;

import "../universalSchemes/ContributionReward.sol";
import "../VotingMachines/GenesisProtocol.sol";


contract Redeemer {
    using SafeMath for uint;

    ContributionReward public contributionReward;
    GenesisProtocol public genesisProtocol;

    constructor(address _contributionReward,address _genesisProtocol) public {
        contributionReward = ContributionReward(_contributionReward);
        genesisProtocol = GenesisProtocol(_genesisProtocol);
    }

   /**
    * @dev helper to redeem rewards for a proposal
    * It calls execute on the proposal if it is not yet executed.
    * It tries to redeem reputation and stake from the GenesisProtocol.
    * It tries to redeem proposal rewards from the contribution rewards scheme.
    * This function does not emit events.
    * A client should listen to GenesisProtocol and ContributionReward redemption events
    * to monitor redemption operations.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _avatar address of the controller
    * @param _beneficiary beneficiary
    * @return gpRewards array
    *          gpRewards[0] - stakerTokenAmount
    *          gpRewards[1] - stakerReputationAmount
    *          gpRewards[2] - voterTokenAmount
    *          gpRewards[3] - voterReputationAmount
    *          gpRewards[4] - proposerReputationAmount
    * @return gpDaoBountyReward array
    *         gpDaoBountyReward[0] - staker dao bounty reward -
    *                                will be zero for the case there is not enough tokens in avatar for the reward.
    *         gpDaoBountyReward[1] - staker potential dao bounty reward.
    * @return executed bool true or false
    * @return crResults array
    *          crResults[0]- reputation - from ContributionReward
    *          crResults[1]- nativeTokenReward - from ContributionReward
    *          crResults[2]- Ether - from ContributionReward
    *          crResults[3]- ExternalToken - from ContributionReward

    */
    function redeem(bytes32 _proposalId,address _avatar,address _beneficiary)
    external
    returns(uint[5] gpRewards,
            uint[2] gpDaoBountyReward,
            bool executed,
            bool[4] crResults)
    {
        GenesisProtocol.ProposalState pState = genesisProtocol.state(_proposalId);
        // solium-disable-next-line operator-whitespace
        if ((pState == GenesisProtocol.ProposalState.PreBoosted)||
            (pState == GenesisProtocol.ProposalState.Boosted)||
            (pState == GenesisProtocol.ProposalState.QuietEndingPeriod)) {
            executed = genesisProtocol.execute(_proposalId);
        }
        pState = genesisProtocol.state(_proposalId);
        if ((pState == GenesisProtocol.ProposalState.Executed) ||
            (pState == GenesisProtocol.ProposalState.Closed)) {
            gpRewards = genesisProtocol.redeem(_proposalId,_beneficiary);
            (gpDaoBountyReward[0],gpDaoBountyReward[1]) = genesisProtocol.redeemDaoBounty(_proposalId,_beneficiary);
            //redeem from contributionReward only if it executed
            if (contributionReward.getProposalExecutionTime(_proposalId,_avatar) > 0) {
                (crResults[0],crResults[1],crResults[2],crResults[3]) = contributionRewardRedeem(_proposalId,_avatar);
            }
        }
    }

    function contributionRewardRedeem(bytes32 _proposalId,address _avatar)
    private
    returns (bool,bool,bool,bool)
    {
        bool[4] memory whatToRedeem;
        whatToRedeem[0] = true; //reputation
        whatToRedeem[1] = true; //nativeToken
        uint periodsToPay = contributionReward.getPeriodsToPay(_proposalId,_avatar,2);
        uint ethReward = contributionReward.getProposalEthReward(_proposalId,_avatar);
        uint externalTokenReward = contributionReward.getProposalExternalTokenReward(_proposalId,_avatar);
        address externalToken = contributionReward.getProposalExternalToken(_proposalId,_avatar);
        ethReward = periodsToPay.mul(ethReward);
        if ((ethReward == 0) || (_avatar.balance < ethReward)) {
            whatToRedeem[2] = false;
        } else {
            whatToRedeem[2] = true;
        }
        periodsToPay = contributionReward.getPeriodsToPay(_proposalId,_avatar,3);
        externalTokenReward = periodsToPay.mul(externalTokenReward);
        if ((externalTokenReward == 0) || (StandardToken(externalToken).balanceOf(_avatar) < externalTokenReward)) {
            whatToRedeem[3] = false;
        } else {
            whatToRedeem[3] = true;
        }
        whatToRedeem = contributionReward.redeem(_proposalId,_avatar,whatToRedeem);
        return (whatToRedeem[0],whatToRedeem[1],whatToRedeem[2],whatToRedeem[3]);
    }
}
