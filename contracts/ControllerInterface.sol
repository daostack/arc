contract GlobalConstraintInterface {
    function pre( address _scheme, uint _param ) returns(bool); // TODO - why do we need param
    function post( address _scheme, uint _param ) returns(bool);    
}


contract ActionInterface {
    function action( uint _param ) returns(bool); // TODO - why do we need param
}

contract ValueSystemInterface { // is Ownable ? why?
    event MintReputation( address indexed _sender, address indexed _beneficary, int256 _amount );
    event MintTokens( address indexed _sender, address indexed _beneficary, int256 _amount );
    event RegisterScheme( address indexed _sender, address indexed _scheme );
    event UnregisterScheme( address indexed _sender, address indexed _scheme );    
    event GenericAction( address indexed _sender, address indexed _action, uint _param );
    event OverrideGlobalConstraint( address indexed _sender, address indexed _newConstraint );
    
    event SendEther( addres indexed _sender, uint _amountInWei, address indexed _to );
    event ExternalTokenTransfer(address indexed _sender, address indexed _externalToken, address indexed _to, uint _value)
    event ExternalTokenTransferFrom(address indexed _sender, address indexed _externalToken, address _from, address _to, uint _value);
    event ExternalTokenApprove(address indexed _sender, StandardToken indexed _externalToken, address _spender, uint _value);
    
    function mintReputation(int256 _amount, address _beneficary) returns(bool);
    function mintTokens(int256 _amount, address _beneficary) returns(bool);    
    function registerScheme( address _scheme ) returns(bool);
    function unregisterScheme( address _scheme ) returns(bool);    
    function genericAction( ActionInterface _action, uint _param ) returns(bool); // TODO discuss name        
    function overrideGlobalConstraint( GlobalConstraintInterface _globaConstraint ) returns(bool);
    
    function sendEther( uint _amountInWei, address _to ) returns (bool);    
    function externalTokenTransfer(StandardToken _externalToken, address _to, uint _value) returns (bool);
    function externalTokenTransferFrom(StandardToken _externalToken, address _from, address _to, uint _value) returns (bool);
    function externalTokenApprove(StandardToken _externalToken, address _spender, uint _value) returns (bool)    
}