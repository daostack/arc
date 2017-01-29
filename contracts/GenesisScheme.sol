import "./Controller.sol";


contract GenesisGlobalConstraint is GlobalConstraintInterface {
    ControllerInterface controller;
    
    function setController( Controller _controller ) returns(bool) {
        controller = _controller;    
    }
        
    function pre( address _scheme, uint _param ) returns(bool) { return true; }
    function post( address _scheme, uint _param ) returns(bool) {
        if( _param == uint(sha3("unregisterScheme")) ) {
            if( ! controller.scheme(_scheme) ) return false;
        }
        
        return true;
    }
}


////////////////////////////////////////////////////////////////////////////////


contract GenesisScheme is SimpleVote {
    Controller controller;
    
    struct Founder {
        int tokens;
        int reputation;
    }
            
    mapping(address=>Founder) founders;
        
    function GenesisScheme( string tokenName,
                            string tokenSymbol,
                            address[] _founders,
                            int[] _tokenAmount,
                            int[] _reputationAmount ) {
                            // TODO - add to constructor of simplevote
        
        GenesisGlobalConstraint globalContraints = new GenesisGlobalConstraint();
        controller = new Controller( tokenName, tokenSymbol, this, globalContraints );
        globalContraints.setController(controller);        
        
        for( uint i = 0 ; i < _founders.length ; i++ ) {
            Founder memory founder;
            founder.tokens = _tokenAmount[i];
            founder.reputation = _reputationAmount[i];
            
            founders[_founders[i]] = founder;
        }
    }
    
    function collectFoundersShare( ) returns(bool) {
        // TODO - event
        Founder memory founder = founders[msg.sender];
        
        if( ! controller.mintTokens( founder.tokens, msg.sender ) ) return throw;
        if( ! controller.mintReputation( founder.reputation, msg.sender ) ) return throw;
        
        delete founders[msg.sender];
        
        return true;                
    }
    
    
    ////////////////////////////////////////////////////////////////////////////    
        
    function proposeScheme( address _scheme ) returns(bool) {
        return newProposal(sha3(_scheme));
    }
            
    function voteScheme( address _scheme, bool _yes ) returns(bool) {
        if( ! voteProposal(sha3(_scheme),_yes) ) return false;
        if( voteResults(sha3(_scheme)) ) {
            if( ! closeProposal(sha3(_scheme) ) ) throw;
            if( controller.schemes(_scheme) ) {
                if( ! controller.unregisterScheme(_scheme) ) throw;
            }
            else {
                if( ! controller.registerScheme(_scheme) ) throw;            
            }
        }
        
    }
}
