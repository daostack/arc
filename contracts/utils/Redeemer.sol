pragma solidity ^0.4.24;

import "../universalSchemes/ContributionReward.sol";
import "../VotingMachines/GenesisProtocol.sol";


contract Redeemer {
    using SafeMath for uint;

    ContributionReward public contributionReward;
    GenesisProtocol public genesisProtocol;

    event RedeemerRedeem(bytes32 indexed _proposalId,
                 bool _execute,
                 bool _genesisProtocolRedeem,
                 bool _genesisProtocolDaoBounty,
                 bool _contributionRewardReputation,
                 bool _contributionRewardNativeToken,
                 bool _contributionRewardEther,
                 bool _contributionRewardExternalToken
    );

    constructor(address _contributionReward,address _genesisProtocol) public {
        contributionReward = ContributionReward(_contributionReward);
        genesisProtocol = GenesisProtocol(_genesisProtocol);
    }

   /**
    * @dev helper to redeem rewards for a proposal
    * It calls execute on the proposal if it is not yet executed.
    * It tries to redeem reputation and stake from the GenesisProtocol.
    * It tries to redeem proposal rewards from the contribution rewards scheme.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _avatar address of the controller
    * @param _beneficiary beneficiary
    * @return result boolean array for the following redeem types:
    *          result[0] -execute -true or false
    *          result[1]- redeem reputation and stakingTokens(GEN) from GenesisProtocol
    *          result[2] -redeem daoBounty(GEN) from GenesisProtocol
    *          result[3]- reputation - from ContributionReward
    *          result[4]- nativeTokenReward - from ContributionReward
    *          result[5]- Ether - from ContributionReward
    *          result[6]- ExternalToken - from ContributionReward

    */
    function redeem(bytes32 _proposalId,address _avatar,address _beneficiary)
    external
    returns(bool[7] result)
    {
        GenesisProtocol.ProposalState pState = genesisProtocol.state(_proposalId);
        // solium-disable-next-line operator-whitespace
        if ((pState == GenesisProtocol.ProposalState.PreBoosted)||
            (pState == GenesisProtocol.ProposalState.Boosted)||
            (pState == GenesisProtocol.ProposalState.QuietEndingPeriod)) {
            result[0] = genesisProtocol.execute(_proposalId);
        }
        pState = genesisProtocol.state(_proposalId);
        if ((pState == GenesisProtocol.ProposalState.Executed) ||
            (pState == GenesisProtocol.ProposalState.Closed)) {
            result[1] = genesisProtocol.redeem(_proposalId,_beneficiary);
            uint daoBountyAmount = genesisProtocol.getRedeemableTokensStakerBounty(_proposalId,_beneficiary);
            if ((daoBountyAmount > 0) && (genesisProtocol.stakingToken().balanceOf(_avatar) >= daoBountyAmount)) {
                result[2] = genesisProtocol.redeemDaoBounty(_proposalId,_beneficiary);
            }
            (result[3],result[4],result[5],result[6]) = contributionRewardRedeem(_proposalId,_avatar);
        }
        emit RedeemerRedeem(
            _proposalId,
            result[0],
            result[1],
            result[2],
            result[3],
            result[4],
            result[5],
            result[6]
        );
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
