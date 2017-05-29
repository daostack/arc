pragma solidity ^0.4.11;
import "../controller/Controller.sol";
import "../SimpleVoteInterface.sol";

contract SimpleContribution {
    Controller                 controller;
    uint                       submissionFee;
    SimpleVoteInterface public simpleVote;

    struct ContributionData {
        bytes32 contributionDescription;
        int     tokenReward;
        int     reputationReward;
        address beneficiary;
    }

    mapping(bytes32=>ContributionData) contributions;

    function SimpleContribution( Controller _controller,
                                 uint       _submissionFee,
                                 SimpleVoteInterface _simpleVote
                                 ) {
        controller = _controller;
        submissionFee = _submissionFee;
        simpleVote = _simpleVote;
        simpleVote.setOwner(this);
        simpleVote.setReputationSystem(controller.nativeReputation());
    }

    function submitContribution( string _contributionDesciption,
                                 int   _tokenReward,
                                 int   _reputationReward,
                                 address beneficiary) returns(bytes32) {
        controller.nativeToken().transferFrom(msg.sender,controller, submissionFee);
        controller.mintTokens(-1*int(submissionFee), controller);

        ContributionData memory data;
        data.contributionDescription = sha3(_contributionDesciption);
        data.tokenReward = _tokenReward;
        data.reputationReward = _reputationReward;
        if (beneficiary == address(0)){
            data.beneficiary = msg.sender;
        } else {
            data.beneficiary = beneficiary;

        }

        // cannot sha3 directly a strucure. God knows why.
        bytes32 contributionId = sha3(data.contributionDescription,
                                      data.tokenReward,
                                      data.reputationReward,
                                      data.beneficiary);

        contributions[contributionId] = data;

        if( ! simpleVote.newProposal(contributionId) ) revert();

        return contributionId;
    }

    function voteContribution( bytes32 contributionId, bool _yes ) returns(bool) {
        if( ! simpleVote.voteProposal(contributionId, _yes,msg.sender) ) revert();
        if( simpleVote.voteResults(contributionId) ) {
            if( ! simpleVote.closeProposal(contributionId) ) revert();
            ContributionData memory data = contributions[ contributionId];
            if( ! controller.mintReputation(data.reputationReward, data.beneficiary) ) revert();
            if( ! controller.mintTokens(data.tokenReward, data.beneficiary) ) revert();
        }

        return true;
    }

}
