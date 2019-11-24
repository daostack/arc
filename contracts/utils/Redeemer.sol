pragma solidity 0.5.13;

import "../universalSchemes/ContributionReward.sol";
import "@daostack/infra/contracts/votingMachines/GenesisProtocol.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";


contract Redeemer {
    using SafeMath for uint;

   /**
    * @dev helper to redeem rewards for a proposal
    * It calls execute on the proposal if it is not yet executed.
    * It tries to redeem reputation and stake from the GenesisProtocol.
    * It tries to redeem proposal rewards from the contribution rewards scheme.
    * This function does not emit events.
    * A client should listen to GenesisProtocol and ContributionReward redemption events
    * to monitor redemption operations.
    * @param _contributionReward contributionReward
    * @param _genesisProtocol genesisProtocol
    * @param _proposalId the ID of the voting in the voting machine
    * @param _avatar address of the controller
    * @param _beneficiary beneficiary
    * @return gpRewards array
    *          gpRewards[0] - stakerTokenAmount
    *          gpRewards[1] - voterReputationAmount
    *          gpRewards[2] - proposerReputationAmount
    * @return gpDaoBountyReward array
    *         gpDaoBountyReward[0] - staker dao bounty reward -
    *                                will be zero for the case there is not enough tokens in avatar for the reward.
    *         gpDaoBountyReward[1] - staker potential dao bounty reward.
    * @return executed  bool true or false
    * @return winningVote
    *                   1 - executed or closed and the winning vote is YES
    *                   2 - executed or closed and the winning vote is NO
    * @return int256 crReputationReward Reputation - from ContributionReward
    * @return int256 crNativeTokenReward NativeTokenReward - from ContributionReward
    * @return int256 crEthReward Ether - from ContributionReward
    * @return int256 crExternalTokenReward ExternalToken - from ContributionReward
    */
    function redeem(ContributionReward _contributionReward,
                    GenesisProtocol _genesisProtocol,
                    bytes32 _proposalId,
                    Avatar _avatar,
                    address _beneficiary)
    external
    returns(uint[3] memory gpRewards,
            uint[2] memory gpDaoBountyReward,
            bool executed,
            uint256 winningVote,
            int256 crReputationReward,
            uint256 crNativeTokenReward,
            uint256 crEthReward,
            uint256 crExternalTokenReward)
    {
        GenesisProtocol.ProposalState pState = _genesisProtocol.state(_proposalId);

        if ((pState == GenesisProtocolLogic.ProposalState.Queued)||
            (pState == GenesisProtocolLogic.ProposalState.PreBoosted)||
            (pState == GenesisProtocolLogic.ProposalState.Boosted)||
            (pState == GenesisProtocolLogic.ProposalState.QuietEndingPeriod)) {
            executed = _genesisProtocol.execute(_proposalId);
        }
        pState = _genesisProtocol.state(_proposalId);
        if ((pState == GenesisProtocolLogic.ProposalState.Executed) ||
            (pState == GenesisProtocolLogic.ProposalState.ExpiredInQueue)) {
            gpRewards = _genesisProtocol.redeem(_proposalId, _beneficiary);
            if (pState == GenesisProtocolLogic.ProposalState.Executed) {
                (gpDaoBountyReward[0], gpDaoBountyReward[1]) =
                _genesisProtocol.redeemDaoBounty(_proposalId, _beneficiary);
            }
            winningVote = _genesisProtocol.winningVote(_proposalId);
            //redeem from contributionReward only if it executed
            if (_contributionReward.getProposalExecutionTime(_proposalId, address(_avatar)) > 0) {
                (crReputationReward, crNativeTokenReward, crEthReward, crExternalTokenReward) =
                contributionRewardRedeem(_contributionReward, _proposalId, _avatar);
            }
        }
    }

    function contributionRewardRedeem(ContributionReward _contributionReward, bytes32 _proposalId, Avatar _avatar)
    private
    returns (int256 reputation, uint256 nativeToken, uint256 eth, uint256 externalToken)
    {
        bool[4] memory whatToRedeem;
        whatToRedeem[0] = true; //reputation
        whatToRedeem[1] = true; //nativeToken
        uint256 periodsToPay = _contributionReward.getPeriodsToPay(_proposalId, address(_avatar), 2);
        uint256 ethReward = _contributionReward.getProposalEthReward(_proposalId, address(_avatar));
        uint256 externalTokenReward = _contributionReward.getProposalExternalTokenReward(_proposalId, address(_avatar));
        address externalTokenAddress = _contributionReward.getProposalExternalToken(_proposalId, address(_avatar));
        ethReward = periodsToPay.mul(ethReward);
        if ((ethReward == 0) || (address(_avatar).balance < ethReward)) {
            whatToRedeem[2] = false;
        } else {
            whatToRedeem[2] = true;
        }
        periodsToPay = _contributionReward.getPeriodsToPay(_proposalId, address(_avatar), 3);
        externalTokenReward = periodsToPay.mul(externalTokenReward);
        if ((externalTokenReward == 0) ||
            (IERC20(externalTokenAddress).balanceOf(address(_avatar)) < externalTokenReward)) {
            whatToRedeem[3] = false;
        } else {
            whatToRedeem[3] = true;
        }
        (reputation, nativeToken, eth, externalToken) = _contributionReward.redeem(_proposalId, _avatar, whatToRedeem);
    }
}
