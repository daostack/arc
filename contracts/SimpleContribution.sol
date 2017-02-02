pragma solidity ^0.4.7;
import "./controller/Controller.sol";
import "./SimpleVote.sol";

contract SimpleContribution is SimpleVote {
    Controller controller;
    uint       submissionFee;
    
    struct ContributionData {
        bytes32 contributionDescription;
        int     tokenReward;
        int     reputationReward;
        address beneficiary;
    }
    
    mapping(bytes32=>ContributionData) contributions;
    
    function SimpleContribution( Controller _controller, uint _submissionFee ) {
        controller = _controller;
        submissionFee = _submissionFee;
        setReputationSystem(controller.nativeReputation());
    }
    
        
    function submitContribution( string _contributionDesciption,
                                 int   _tokenReward,
                                 int   _reputationReward ) returns(bytes32) {
        if( ! controller.nativeToken().transferFrom(msg.sender,controller, submissionFee) ) throw;
        if( ! controller.mintTokens(-1*int(submissionFee), controller) ) throw;
        
        ContributionData memory data;
        data.contributionDescription = sha3(_contributionDesciption);
        data.tokenReward = _tokenReward;
        data.reputationReward = _reputationReward;
        data.beneficiary = msg.sender;
        
        // cannot sha3 directly a strucure. God knows why.
        bytes32 contributionId = sha3(data.contributionDescription,
                                      data.tokenReward,
                                      data.reputationReward,
                                      data.beneficiary);
                
        contributions[contributionId] = data;
        
        if( ! newProposal(contributionId) ) throw;
        
        return contributionId;
    }
    
    function voteContribution( bytes32 contributionId, bool _yes ) returns(bool) {
        if( ! voteProposal(contributionId, _yes) ) throw;
        if( voteResults(contributionId) ) {
            if( ! closeProposal(contributionId) ) throw;
            ContributionData memory data = contributions[ contributionId];
            if( ! controller.mintReputation(data.reputationReward, data.beneficiary) ) throw;
            if( ! controller.mintTokens(data.tokenReward, data.beneficiary) ) throw;            
        }
        
        return true;
    }
    
}