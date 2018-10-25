pragma solidity ^0.4.24;

import "../schemes/ContributionReward.sol";
import "@daostack/infra/contracts/VotingMachines/GenesisProtocol.sol";


contract Redeemer {
    using SafeMath for uint;

    GenesisProtocol public genesisProtocol;

    constructor(address _genesisProtocol) public {
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
    * @param _contributionReward ContributionReward of the ContributionReward scheme
    * @param _avatar address of the controller
    * @param _proposalId the ID of the voting in the voting machine
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
    * @return executed  bool true or false
    * @return winningVote
    *                   1 - executed or closed and the winning vote is YES
    *                   2 - executed or closed and the winning vote is NO
    * @return int crReputationReward Reputation - from ContributionReward
    * @return int crNativeTokenReward NativeTokenReward - from ContributionReward
    * @return int crEthReward Ether - from ContributionReward
    * @return int crExternalTokenReward ExternalToken - from ContributionReward
    */
    function redeem(ContributionReward _contributionReward, address _avatar, bytes32 _proposalId, address _beneficiary)
    external
    returns(
        uint[5] gpRewards,
        uint[2] gpDaoBountyReward,
        bool executed,
        uint winningVote,
        int crReputationReward,
        uint crNativeTokenReward,
        uint crEthReward,
        uint crExternalTokenReward
    )
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
            winningVote = genesisProtocol.winningVote(_proposalId);
            //redeem from contributionReward only if it executed
            if (_contributionReward.getProposalExecutionTime(_proposalId) > 0) {
                (crReputationReward,crNativeTokenReward,crEthReward,crExternalTokenReward) = contributionRewardRedeem(_contributionReward, _avatar, _proposalId);
            }
        }
    }

    function contributionRewardRedeem(
        ContributionReward _contributionReward,
        address _avatar,
        bytes32 _proposalId
    )
    private
    returns (
        int reputation,
        uint nativeToken,
        uint eth,
        uint externalToken
    )
    {
        bool[4] memory whatToRedeem;
        whatToRedeem[0] = true; // reputation
        whatToRedeem[1] = true; // nativeToken
        uint periodsToPay = _contributionReward.getPeriodsToPay(_proposalId, 2);
        uint ethReward = _contributionReward.getProposalEthReward(_proposalId);
        uint externalTokenReward = _contributionReward.getProposalExternalTokenReward(_proposalId);
        address externalTokenAddress = _contributionReward.getProposalExternalToken(_proposalId);
        ethReward = periodsToPay.mul(ethReward);
        if ((ethReward == 0) || (_avatar.balance < ethReward)) {
            whatToRedeem[2] = false;
        } else {
            whatToRedeem[2] = true;
        }
        periodsToPay = _contributionReward.getPeriodsToPay(_proposalId, 3);
        externalTokenReward = periodsToPay.mul(externalTokenReward);
        if ((externalTokenReward == 0) || (StandardToken(externalTokenAddress).balanceOf(_avatar) < externalTokenReward)) {
            whatToRedeem[3] = false;
        } else {
            whatToRedeem[3] = true;
        }
        (reputation,nativeToken,eth,externalToken) = _contributionReward.redeem(_proposalId, whatToRedeem);
    }
}
