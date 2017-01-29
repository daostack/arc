import "./Controller.sol";

contract SimpleContribution is SimpleVote {
    Controller controller;
    uint       submissionFee;
    
    struct ContributionData {
        bytes32 contributionDescription;
        int    tokenReward;
        int    reputationReward;
        address beneficiary;
    }
    
    mapping(bytes32=>ContributionData) contributions;
    
    function SimpleContribution( Controller _controller, uint _submissionFee ) {
        controller = _controller;
        submissionFee = _submissionFee;
        // TODO reputation
    }
    
    function submitContribution( string _contributionDesciption,
                                 int   _tokenReward,
                                 int   _reputationReward ) returns(bytes32) returns(bytes32){
        if( ! controller.nativeToken.transferFrom(msg.sender,controller, submissionFee) ) throw;
        if( ! controller.mintTokens((int)submissionFee * -1, controller) ) throw;
        
        ContributionData memory data;
        data.contributionDescription = sha3(_contributionDesciption);
        data.tokenReward = _tokenReward;
        data.reputationReward = _reputationReward;
        data.beneficiary = msg.sender;
        
        bytes32 id = sha3(data);        
        contributions[id] = data;
        
        if( ! newProposal(id) ) throw;
        
        return id;
    }
    
    function vote( bytes32 contributionId, bool _yes ) returns(bool) {
        if( ! voteProposal(contributionId, _yes) ) throw;
        if( voteResults(contributionId) ) {
            if( ! closeProposal(contributionId) ) throw;
            ContributionData memory data = contributions[ contributionId];
            if( ! controller.mintReputation(data.reputationReward,data.beneficiary) ) throw;
            if( ! controller.mintmintTokens(data.tokenReward,data.beneficiary) ) throw;            
        }
        
        return true;
    }
}