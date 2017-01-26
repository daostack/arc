contract GlobalConstraintInterface {
    function pre( uint _param ) returns(bool); // TODO - why do we need param
    function post( uint _param ) returns(bool);    
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
    
    function mintReputation(int256 _amount, address _beneficary) returns(bool);
    function mintTokens(int256 _amount, address _beneficary) returns(bool);    
    function registerScheme( address _scheme ) returns(bool);
    function unregisterScheme( address _scheme ) returns(bool);    
    function genericAction( ActionInterface _action, uint _param ) returns(bool); // TODO discuss name        
    function overrideGlobalConstraint( GlobalConstraintInterface _globaConstraint ) returns(bool);
}