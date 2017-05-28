pragma solidity ^0.4.11;

import "../controller/Controller.sol"; // Should change to intreface.
import "../UniversalSimpleVoteInterface.sol";
import "./UniversalScheme.sol";

contract UniversalSimpleContribution is UniversalScheme {

    struct ContributionData {
      bytes32         contributionDescriptionHash;
      uint            nativeTokenReward;
      uint            reputationReward;
      uint            ethReward;
      StandardToken   externalToken;
      uint            externalTokenReward;
      address         beneficiary;
    }

    struct Organization {
      bool isRegistered;
      uint precToApprove;
      uint orgNativeTokenFee;
      uint schemeNatvieTokenFee;
      UniversalSimpleVoteInterface simpleVote;
      mapping(bytes32=>ContributionData) contributions;
    }

    mapping(address=>Organization) organizations;

    function UniversalSimpleContribution(StandardToken _nativeToken, uint _fee, address _benificiary) {
      updateParameters(_nativeToken, _fee, _benificiary, bytes32(0));
    }

    function parametersHash(uint _precToApprove,
                                uint _orgNativeTokenFee,
                                uint _schemeNatvieTokenFee,
                                UniversalSimpleVoteInterface _universalSimpleVote)
                                constant returns(bytes32) {
      require(_precToApprove<=100);
      return (sha3(_precToApprove, _orgNativeTokenFee, _schemeNatvieTokenFee, _universalSimpleVote));
    }

    function checkParameterHashMatch(Controller _controller,
                     uint _precToApprove,
                     uint _orgNativeTokenFee,
                     uint _schemeNatvieTokenFee,
                     UniversalSimpleVoteInterface _universalSimpleVote) constant returns(bool) {
       return (_controller.getSchemeParameters(this) == parametersHash(_precToApprove, _orgNativeTokenFee, _schemeNatvieTokenFee,_universalSimpleVote));
    }

    function addOrUpdateOrg(Controller _controller,
                     uint _precToApprove,
                     uint _orgNativeTokenFee,
                     uint _schemeNatvieTokenFee,
                     UniversalSimpleVoteInterface _universalSimpleVote) {
        require(_controller.isSchemeRegistered(this));
        require(checkParameterHashMatch(_controller, _precToApprove, _orgNativeTokenFee, _schemeNatvieTokenFee, _universalSimpleVote));

        // Pay fees for using scheme:
        if( ! nativeToken.transferFrom(msg.sender, benificiary, fee) ) revert();

        Organization org = organizations[_controller];
        org.isRegistered = true;
        org.precToApprove = _precToApprove;
        org.orgNativeTokenFee = _orgNativeTokenFee;
        org.schemeNatvieTokenFee = _schemeNatvieTokenFee;
        org.simpleVote = _universalSimpleVote;
    }

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
        if( ! _controller.nativeToken().transferFrom(msg.sender, _controller, org.orgNativeTokenFee) ) revert();
        if( ! nativeToken.transferFrom(msg.sender, _controller, org.schemeNatvieTokenFee) ) revert();

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

        UniversalSimpleVoteInterface simpleVote = org.simpleVote;
        bytes32 contributionId = simpleVote.propose(_controller.nativeReputation(), org.precToApprove);

        organizations[_controller].contributions[contributionId] = data;
        return contributionId;
    }

    function voteContribution( Controller _controller, bytes32 _contributionId, bool _yes ) returns(bool) {
        UniversalSimpleVoteInterface simpleVote = organizations[_controller].simpleVote;
        if( ! simpleVote.vote(_contributionId, _yes, msg.sender) ) return false;
        if( simpleVote.voteResults(_contributionId) ) {
            ContributionData memory data = organizations[_controller].contributions[_contributionId];
            if( ! simpleVote.cancellProposel(_contributionId) ) revert();
            if( ! _controller.mintReputation(int(data.reputationReward), data.beneficiary) ) revert();
            if( ! _controller.mintTokens(int(data.nativeTokenReward), data.beneficiary) ) revert();
            if( ! _controller.sendEther(data.ethReward, data.beneficiary) ) revert();
            if (data.externalToken != address(0))
            if( ! _controller.externalTokenTransfer(data.externalToken, data.beneficiary, data.externalTokenReward) ) revert();
        }
        return true;
    }

}
