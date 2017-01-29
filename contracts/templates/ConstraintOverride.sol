pragma solidity ^0.4.8;
import "./Controller.sol";
import "./SimpleVote.sol";


////////////////////////////////////////////////////////////////////////////////


contract ConstraintOverride is SimpleVote {
    Controller controller;
    function Constraint( Controller _controller ) {
        Controller controller = _controller;
        setReputationSystem(controller.nativeReputation());
    }

    ////////////////////////////////////////////////////////////////////////////    
        
    function proposeConstraint( GlobalConstraintInterface _constraint ) returns(bool) {
        return newProposal(sha3(_constraint));
    }
            
    function voteConstraint( GlobalConstraintInterface _constraint, bool _yes ) returns(bool) {
        if( ! voteProposal(sha3(_constraint),_yes) ) return false;
        if( voteResults(sha3(_constraint)) ) {
            if( ! closeProposal(sha3(_constraint) ) ) throw;   
            if( ! controller.overrideGlobalConstraint(_constraint) ) throw;
        }        
    }
    
}
