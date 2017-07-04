pragma solidity ^0.4.11;

import "../controller/Controller.sol";
import "../VotingMachines/BoolVoteInterface.sol";
import "./UniversalScheme.sol";

/**
 * @title Universal simple contribution.
 * @dev An agent can ask an organization to recognize a contribution and reward
 * him with token, reputation, ether or any combination.
 */

contract UniversalSimpleContribution is UniversalScheme {
    // A sturct holding the data for a contribution proposal
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
      uint schemeNatvieTokenFee;
      bytes32 voteApproveParams;
      BoolVoteInterface boolVote;
      mapping(bytes32=>ContributionData) contributions;
    }

    // A mapping from thr organization (controller) address to the saved data of the organization:
    mapping(address=>Organization) organizations;

    // Constructor, updating the initial prarmeters:
    function UniversalSimpleContribution(StandardToken _nativeToken, uint _fee, address _beneficiary) {
      updateParameters(_nativeToken, _fee, _beneficiary, bytes32(0));
    }

    // The format of the hashing of the parameters:
    function parametersHash(uint _orgNativeTokenFee,
                                uint _schemeNatvieTokenFee,
                                bytes32 _voteApproveParams,
                                BoolVoteInterface _boolVote)
                                constant returns(bytes32) {
      return (sha3(_voteApproveParams, _orgNativeTokenFee, _schemeNatvieTokenFee, _boolVote));
    }

    // Check that the parameters listed match the ones in the controller:
    function checkParameterHashMatch(Controller _controller,
                               uint _orgNativeTokenFee,
                               uint _schemeNatvieTokenFee,
                               bytes32 _voteApproveParams,
                               BoolVoteInterface _boolVote) constant returns(bool) {
       return (_controller.getSchemeParameters(this) == parametersHash(_orgNativeTokenFee, _schemeNatvieTokenFee, _voteApproveParams,_boolVote));
    }

    // Adding an organization to the universal scheme:
    function addOrUpdateOrg(Controller _controller,
                               uint _orgNativeTokenFee,
                               uint _schemeNatvieTokenFee,
                               bytes32 _voteApproveParams,
                               BoolVoteInterface _boolVote) {
        require(_controller.isSchemeRegistered(this));
        require(checkParameterHashMatch(_controller, _orgNativeTokenFee, _schemeNatvieTokenFee, _voteApproveParams, _boolVote));

        // Pay fees for using scheme:
        nativeToken.transferFrom(msg.sender, beneficiary, fee);

        Organization org = organizations[_controller];
        org.isRegistered = true;
        org.voteApproveParams = _voteApproveParams;
        org.orgNativeTokenFee = _orgNativeTokenFee;
        org.schemeNatvieTokenFee = _schemeNatvieTokenFee;
        org.boolVote = _boolVote;
    }

    // Sumitiing a proposal for a reward against a contribution:
    function submitContribution( Controller _controller,
                                  string          _contributionDesciption,
                                  uint            _nativeTokenReward,
                                  uint            _reputationReward,
                                  uint            _ethReward,
                                  StandardToken   _externalToken,
                                  uint            _externalTokenReward,
                                  address         _beneficiary) returns(bytes32) {
        Organization memory org = organizations[_controller];
        require(org.isRegistered);

        // Pay fees for submitting the contribution:
        _controller.nativeToken().transferFrom(msg.sender, _controller, org.orgNativeTokenFee);
        nativeToken.transferFrom(msg.sender, _controller, org.schemeNatvieTokenFee);

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

        organizations[_controller].contributions[contributionId] = data;
        return contributionId;
    }


    // Voting on a contribution and also handle the execuation when vote is over: 
    function voteContribution( Controller _controller, bytes32 _contributionId, bool _yes ) returns(bool) {
        BoolVoteInterface boolVote = organizations[_controller].boolVote;
        if( ! boolVote.vote(_contributionId, _yes, msg.sender) ) return false;
        if( boolVote.voteResults(_contributionId) ) {
            ContributionData memory data = organizations[_controller].contributions[_contributionId];
            if( ! boolVote.cancelProposal(_contributionId) ) revert();
            if( ! _controller.mintReputation(int(data.reputationReward), data.beneficiary) ) revert();
            if( ! _controller.mintTokens(data.nativeTokenReward, data.beneficiary ) ) revert();
            if( ! _controller.sendEther(data.ethReward, data.beneficiary) ) revert();
            if (data.externalToken != address(0))
            if( ! _controller.externalTokenTransfer(data.externalToken, data.beneficiary, data.externalTokenReward) ) revert();
        }
        return true;
    }

}
