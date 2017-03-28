pragma solidity ^0.4.7;
import '../controller/Controller.sol';
import "../SimpleVoteInterface.sol";

/*
 * ProposeScheme is a Schema for proposing, registering and unregistering Schemes
 *
 */

contract ProposeScheme {
    Controller public controller;
    SimpleVoteInterface public simpleVote;
        
    function ProposeScheme(
        Controller _controller,
        SimpleVoteInterface _simpleVote
    ) {
        controller = _controller;
        simpleVote = _simpleVote;
        simpleVote.setOwner(this);        
        simpleVote.setReputationSystem(controller.nativeReputation());
    }
    
    function proposeScheme( address _scheme ) returns(bool) {
        return simpleVote.newProposal(sha3(_scheme));
    }
            
    function voteScheme( address _scheme, bool _yes ) returns(bool) {
        if(!simpleVote.voteProposal(sha3(_scheme),_yes, msg.sender)) {
            return false;
        }
        if(simpleVote.voteResults(sha3(_scheme)) ) {
            if( ! simpleVote.closeProposal(sha3(_scheme) ) ) throw;
            if( controller.schemes(_scheme) ) {
                if( ! controller.unregisterScheme(_scheme) ) throw;
            } else {
                if( ! controller.registerScheme(_scheme) ) throw;            
            }
        }
    }
    
    function getVoteStatus(address _scheme) constant returns(uint[4]) {
        return simpleVote.voteStatus(sha3(_scheme));
    }     
}
