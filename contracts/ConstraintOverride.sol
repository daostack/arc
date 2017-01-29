import "./Controller.sol";


////////////////////////////////////////////////////////////////////////////////


contract ContraintOverride is SimpleVote {
    Controller controller;
    function Constraint( Controller controller ) {
        Controller controller = _controller;        

    }

    ////////////////////////////////////////////////////////////////////////////    
        
    function proposeConstraint( GlobalConstraintInterface _constraint ) returns(bool) {
        return newProposal(sha3(_constraint));
    }
            
    function voteScheme( GlobalConstraintInterface _constraint, bool _yes ) returns(bool) {
        if( ! voteProposal(sha3(_constraint),_yes) ) return false;
        if( voteResults(sha3(_constraint)) ) {
            if( ! closeProposal(sha3(_constraint) ) ) throw;   
            if( ! controller.overrideGlobalConstraint(_constraint) ) throw;
        }        
    }
    
}
