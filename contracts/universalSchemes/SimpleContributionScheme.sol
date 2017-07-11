pragma solidity ^0.4.11;

import "../controller/Controller.sol";
import "../controller/Avatar.sol";
import "../VotingMachines/BoolVoteInterface.sol";
import "./UniversalScheme.sol";

/**
 * @title A scheme for proposing and rewarding contributions to an organization
 * @dev An agent can ask an organization to recognize a contribution and reward
 * him with token, reputation, ether or any combination.
 */


contract SimpleContributionScheme is UniversalScheme {
    // A struct holding the data for a contribution proposal
    struct ContributionData {
      bytes32         contributionDescriptionHash; // Hash of contributtion document.
      uint            nativeTokenReward; // Reward asked in the native token of the organization.
      uint            reputationReward; // Organization reputation reward requested.
      uint            ethReward;
      StandardToken   externalToken;
      uint            externalTokenReward;
      address         beneficiary;
    }

    // Struct holding the data for each organization
    struct Organization {
      bool isRegistered;
      // A contibution fee can be in the organization token or the scheme token or a combination
      uint orgNativeTokenFee;
      uint schemeNativeTokenFee;
      bytes32 voteApproveParams;
      BoolVoteInterface boolVote;
      mapping(bytes32=>ContributionData) contributions;
    }

    // A mapping from thr organization (Avatar) address to the saved data of the organization:
    mapping(address=>Organization) organizations;

    /**
     * @dev the constructor takes a token address, fee and beneficiary
     */
    function SimpleContributionScheme(StandardToken _nativeToken, uint _fee, address _beneficiary) {
      updateParameters(_nativeToken, _fee, _beneficiary, bytes32(0));
    }

    /**
     * @dev return a hash of the given parameters
     * @param _orgNativeTokenFee ???
     * @param _schemeNativeTokenFee ???
     * @param _voteApproveParams parameters for the voting machine used to approve a contribution
     * @param _boolVote the voting machine used to approve a contribution
     * @return a hash of the parameters
     */
    // TODO: invert order of _voteApproveParams and _boolVote
    // TODO: document where the two fees are used, and what for
    function hashParameters(
        uint _orgNativeTokenFee,
        uint _schemeNativeTokenFee,
        bytes32 _voteApproveParams,
        BoolVoteInterface _boolVote
    ) constant returns(bytes32) {
        return (sha3(_voteApproveParams, _orgNativeTokenFee, _schemeNativeTokenFee, _boolVote));
    }

    function checkParameterHashMatch(
        Avatar _avatar,
        uint _orgNativeTokenFee,
        uint _schemeNativeTokenFee,
        bytes32 _voteApproveParams,
        BoolVoteInterface _boolVote
    ) constant returns(bool) {
        Controller controller = Controller(_avatar.owner());
        return (controller.getSchemeParameters(this) == hashParameters(_orgNativeTokenFee, _schemeNativeTokenFee, _voteApproveParams,_boolVote));
    }

    function addOrUpdateOrg(
        Avatar _avatar,
        uint _orgNativeTokenFee,
        uint _schemeNativeTokenFee,
        bytes32 _voteApproveParams,
        BoolVoteInterface _boolVote
    ) {
        require(checkParameterHashMatch(_avatar, _orgNativeTokenFee, _schemeNativeTokenFee, _voteApproveParams, _boolVote));

        // Pay fees for using scheme:
        nativeToken.transferFrom(_avatar, beneficiary, fee);

        Organization org = organizations[_avatar];
        org.isRegistered = true;
        org.voteApproveParams = _voteApproveParams;
        org.orgNativeTokenFee = _orgNativeTokenFee;
        org.schemeNativeTokenFee = _schemeNativeTokenFee;
        org.boolVote = _boolVote;
    }

    // Sumitting a proposal for a reward against a contribution:
    function submitContribution(
        Avatar _avatar,
        string _contributionDesciption,
        uint _nativeTokenReward,
        uint _reputationReward,
        uint _ethReward,
        StandardToken _externalToken,
        uint _externalTokenReward,
        address _beneficiary
    ) returns(bytes32) {
        Organization memory org = organizations[_avatar];
        require(org.isRegistered);

        // Pay fees for submitting the contribution:
        _avatar.nativeToken().transferFrom(msg.sender, _avatar, org.orgNativeTokenFee);
        nativeToken.transferFrom(msg.sender, _avatar, org.schemeNativeTokenFee);

        ContributionData memory data;
        data.contributionDescriptionHash = sha3(_contributionDesciption);
        data.nativeTokenReward = _nativeTokenReward;
        data.reputationReward = _reputationReward;
        data.ethReward = _ethReward;
        data.externalToken = _externalToken;
        data.externalTokenReward = _externalTokenReward;
        if (_beneficiary == address(0)){
          data.beneficiary = msg.sender;
        } else {
          data.beneficiary = _beneficiary;
        }

        BoolVoteInterface boolVote = org.boolVote;
        bytes32 contributionId = boolVote.propose(org.voteApproveParams);

        organizations[_avatar].contributions[contributionId] = data;
        return contributionId;
    }

    // Voting on a contribution and also handle the execuation when vote is over:
    function voteContribution(
        Avatar _avatar, bytes32 _contributionId, bool _yes ) returns(bool) {
        BoolVoteInterface boolVote = organizations[_avatar].boolVote;
        if( ! boolVote.vote(_contributionId, _yes, msg.sender) ) return false;
        if( boolVote.voteResults(_contributionId) ) {
            ContributionData memory data = organizations[_avatar].contributions[_contributionId];
            if( ! boolVote.cancelProposal(_contributionId) ) revert();
            Controller controller = Controller(_avatar.owner());
            if( ! controller.mintReputation(int(data.reputationReward), data.beneficiary) ) revert();
            if( ! controller.mintTokens(data.nativeTokenReward, data.beneficiary ) ) revert();
            if( ! controller.sendEther(data.ethReward, data.beneficiary) ) revert();
            if (data.externalToken != address(0))
            if( ! controller.externalTokenTransfer(data.externalToken, data.beneficiary, data.externalTokenReward) ) revert();
        }
        return true;
    }

}
