pragma solidity ^0.4.4;

import "./Reputation.sol";
import "./MintableToken.sol";
import "./SystemValueInterface.sol";



contract Controller is ControllerInterface { // is Ownable ? why?
    mapping(address=>bool) public schemes;
    // TODO - should be iterable? UI can use events

    GlobalConstraintInterface public globalConstraints;
    
    MintableToken    public nativeToken;
    Reputation       public nativeReputation;
    
        
    // ctor
    function Controller( string _name,
                         string _symbol,
                         address _genesisScheme,
                         address _genesisGlobalContraints ) {
        nativeToken = new MintableToken(_name, _symbol);
        nativeReputation = new Reputation();
        nativeReputation.mint(0, msg.sender);
        
        schemes[_genesisScheme] = true;
        
        globalConstraints = _genesisGlobalContraints;
    }
    
    modifier onlyRegisteredScheme() {
        if (! schemes[msg.sender]) throw;
        _;
    }    
    
    modifier onlySubjectToConstraint( string func ) {
        if( ! globalConstraints.pre(msg.sender, uint(sha3(func))) ) throw;
        _;
        if( ! globalConstraints.post(msg.sender, uint(sha3(func)) ) ) throw;        
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
    
    function sendEther( uint _amountInWei, address _to )
    onlyRegisteredScheme onlySubjectToConstraint("sendEther")
    returns(bool) {
        SendEther( msg.sender, _amountInWei, _to );
        if( ! _to.send(_amountInWei ) ) throw;
        return true;        
    }
    
    function externalTokentransfer(StandardToken _externalToken, address _to, uint _value)
    onlyRegisteredScheme onlySubjectToConstraint("externalTokenTransferExternal")
    returns(bool) {
        ExternalTokenTransfer(msg.sender, _externalToken, _to, _value);
        return _externalToken.transfer( _to, _value );
    }
        
    function externalTokenTransferFrom(StandardToken _externalToken, address _from, address _to, uint _value)
    onlyRegisteredScheme onlySubjectToConstraint("externalTokenTransferFrom")
    returns(bool) {
        ExternalTokenTransferFrom(msg.sender, _externalToken, _from, _to, _value);
        return _externalToken.transferFrom( _from, _to, _value );
    }
    
    function externalTokenApprove(StandardToken _externalToken, address _spender, uint _value)
    onlyRegisteredScheme onlySubjectToConstraint("externalTokenApprove")
    returns(bool) {
        ExternalTokenApprove( msg.sender, _externalToken, _spender, _value );
        return _externalToken.approve( _spender, _value );        
    }
            
    function() payable {
        Fallback( msg.sender, msg.value );
    }        
}