pragma solidity ^0.4.4;

import "./Reputation.sol";
import "./MintableToken.sol";
import "./SystemValueInterface.sol";
import "./GenesisStubs.sol";

contract ValueSystem is ValueSystemInterface { // is Ownable ? why?
    mapping(address=>bool) public schemes;
    // TODO - should be iterable? UI can use events

    GlobalConstraintInterface public globalConstraints;
    
    MintableToken    public nativeToken;
    Reputation       public nativeReputation;
    
    
    event MintReputation( address indexed _sender, address indexed _beneficary, int256 _amount );
    event MintTokens( address indexed _sender, address indexed _beneficary, int256 _amount );
    event RegisterScheme( address indexed _sender, address indexed _scheme );
    event UnregisterScheme( address indexed _sender, address indexed _scheme );    
    event GenericAction( address indexed _sender, address indexed _action, uint _param );
    event OverrideGlobalConstraint( address indexed _sender, address indexed _newConstraint );    
    
    // ctor
    function ValueSystem( string name, string symbol ) {
        nativeToken = new MintableToken(name, symbol);
        nativeReputation = new Reputation();
        nativeReputation.mint(1, msg.sender);
        
        GenesisScheme genesisScheme = new GenesisScheme(nativeReputation, this);
        schemes[genesisScheme] = true;
        
        globalConstraints = new GenesisGlobalConstraint();
    }
    
    modifier onlyRegisteredScheme() {
        if (! schemes[msg.sender]) throw;
        _;
    }    
    
    modifier onlySubjectToConstraint( string func ) {
        if( ! globalConstraints.pre(uint(sha3(func))) ) throw;
        _;
        if( ! globalConstraints.post(uint(sha3(func))) ) throw;        
    }

    function mintReputation(int256 _amount, address _beneficary) 
        onlyRegisteredScheme onlySubjectToConstraint("mintReputation")
        returns(bool){
        MintReputation(msg.sender, _beneficary, _amount);
        return nativeReputation.mint(_amount, _beneficary);
    }
    
    function mintTokens(int256 _amount, address _beneficary)
        onlyRegisteredScheme onlySubjectToConstraint("mintTokens")
        returns(bool){
        MintTokens( msg.sender, _beneficary, _amount );
        return nativeToken.mint(_amount, _beneficary);
    }
    
    function registerScheme( address _scheme )
        onlyRegisteredScheme onlySubjectToConstraint("registerScheme")
        returns(bool){        
        RegisterScheme(msg.sender, _scheme);
        schemes[_scheme] = true;
        return true;
    }
    
    function unregisterScheme( address _scheme )
        onlyRegisteredScheme onlySubjectToConstraint("unregisterScheme")
        returns(bool){    
        UnregisterScheme(msg.sender, _scheme);            
        schemes[_scheme] = false;
        return true;
    }
    
    function genericAction( ActionInterface _action, uint _param ) // TODO discuss name
        onlyRegisteredScheme onlySubjectToConstraint("genericAction")
        returns(bool){    
        GenericAction( msg.sender, _action, _param );
        return _action.delegatecall(bytes4(sha3("action(uint256)")), _param);
    }
    
    function overrideGlobalConstraint( GlobalConstraintInterface _globaConstraint )
        onlyRegisteredScheme onlySubjectToConstraint("overrideGlobalConstraint")
        returns(bool) {
        OverrideGlobalConstraint( msg.sender, _globaConstraint );
        globalConstraints = _globaConstraint;
        // don't run post constraints
        return true;        
    }
}