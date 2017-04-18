pragma solidity ^0.4.7;

import "./Reputation.sol";
import "./MintableToken.sol";


contract ActionInterface {
    function action( uint _param ) returns(bool);
}


contract Controller { // is Ownable ? why?
    mapping(address=>bool) public schemes;
    // TODO - should be iterable? UI can use events

    MintableToken    public nativeToken;
    Reputation       public nativeReputation;

    event MintReputation( address indexed _sender, address indexed _beneficary, int256 _amount );
    event MintTokens( address indexed _sender, address indexed _beneficary, int256 _amount );
    event RegisterScheme( address indexed _sender, address indexed _scheme );
    event UnregisterScheme( address indexed _sender, address indexed _scheme );
    event GenericAction( address indexed _sender, address indexed _action, uint _param );

    event SendEther( address indexed _sender, uint _amountInWei, address indexed _to );
    event ExternalTokenTransfer(address indexed _sender, address indexed _externalToken, address indexed _to, uint _value);
    event ExternalTokenTransferFrom(address indexed _sender, address indexed _externalToken, address _from, address _to, uint _value);
    event ExternalTokenApprove(address indexed _sender, StandardToken indexed _externalToken, address _spender, uint _value);

    event TokenDisapprove( address indexed _sender, address _token, uint _value );
    event Fallback(address indexed _sender, uint _value);

    // ctor
    function Controller(
        string _name,
        string _symbol,
        address _genesisScheme)
    {
        nativeToken = new MintableToken(_name, _symbol);
        nativeReputation = new Reputation();
        nativeReputation.mint(0, msg.sender);

        schemes[_genesisScheme] = true;
    }

    modifier onlyRegisteredScheme() {
        if (!schemes[msg.sender]) throw;
        _;
    }

    function mintReputation(int256 _amount, address _beneficary)
        onlyRegisteredScheme
        returns(bool){
        MintReputation(msg.sender, _beneficary, _amount);
        return nativeReputation.mint(_amount, _beneficary);
    }

    function mintTokens(int256 _amount, address _beneficary)
        onlyRegisteredScheme
        returns(bool){
        MintTokens(msg.sender, _beneficary, _amount);
        return nativeToken.mint(_amount, _beneficary);
    }

    function registerScheme( address _scheme )
        onlyRegisteredScheme
        returns(bool){
        RegisterScheme(msg.sender, _scheme);
        schemes[_scheme] = true;
        return true;
    }

    function unregisterScheme( address _scheme )
        onlyRegisteredScheme
        returns(bool){
        UnregisterScheme(msg.sender, _scheme);
        schemes[_scheme] = false;
        return true;
    }

    function genericAction( ActionInterface _action, uint _param ) // TODO discuss name
        onlyRegisteredScheme
        returns(bool){
        GenericAction( msg.sender, _action, _param );
        return _action.delegatecall(bytes4(sha3("action(uint256)")), _param);
    }


    function sendEther( uint _amountInWei, address _to )
    onlyRegisteredScheme
    returns(bool) {
        SendEther( msg.sender, _amountInWei, _to );
        if( ! _to.send(_amountInWei ) ) throw;
        return true;
    }

    function externalTokenTransfer(StandardToken _externalToken, address _to, uint _value)
    onlyRegisteredScheme
    returns(bool) {
        ExternalTokenTransfer(msg.sender, _externalToken, _to, _value);
        return _externalToken.transfer( _to, _value );
    }

    function externalTokenTransferFrom(StandardToken _externalToken, address _from, address _to, uint _value)
    onlyRegisteredScheme
    returns(bool) {
        ExternalTokenTransferFrom(msg.sender, _externalToken, _from, _to, _value);
        return _externalToken.transferFrom( _from, _to, _value );
    }

    function externalTokenApprove(StandardToken _externalToken, address _spender, uint _value)
    onlyRegisteredScheme
    returns(bool) {
        ExternalTokenApprove( msg.sender, _externalToken, _spender, _value );
        return _externalToken.approve( _spender, _value );
    }

    // function in case someone approved a token to the contract and changed
    // his mind. Can be called both for internal or external tokens.

    function tokenDisapprove(StandardToken _token, uint _value )
    returns(bool) {
        TokenDisapprove( msg.sender, _token, _value );
        return _token.transferFrom( msg.sender,msg.sender, _value );
    }

    function() payable {
        Fallback( msg.sender, msg.value );
    }
}
