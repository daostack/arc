pragma solidity ^0.4.7;
import '../controller/Controller.sol';
import "../SimpleVoteInterface.sol";
import "./ProposeScheme.sol";

/*
 * GenesisScheme is a helper to create a Controller
 *
 */


contract GenesisScheme is ProposeScheme {
    Controller public controller;
    SimpleVoteInterface public simpleVote;
    
    struct Founder {
        int tokens;
        int reputation;
    }
            
    mapping(address=>Founder) founders;
        
    function GenesisScheme(
        string tokenName,
        string tokenSymbol,
        address[] _founders,
        int[] _tokenAmount,
        int[] _reputationAmount,
        SimpleVoteInterface _simpleVote
    ) {
        
        controller = new Controller(tokenName, tokenSymbol, this);
        simpleVote = _simpleVote;
        simpleVote.setOwner(this);        
        simpleVote.setReputationSystem(controller.nativeReputation());
        
        for( uint i = 0 ; i < _founders.length ; i++ ) {
            Founder memory founder;
            founder.tokens = _tokenAmount[i];
            founder.reputation = _reputationAmount[i];
            founders[_founders[i]] = founder;
        }
    }
    
    function collectFoundersShare() returns(bool) {
        // TODO - event
        Founder memory founder = founders[msg.sender];
        
        if (!controller.mintTokens(founder.tokens, msg.sender)) throw;
        if (!controller.mintReputation(founder.reputation, msg.sender)) throw;
        
        delete founders[msg.sender];
        
        return true;                
    }
}
