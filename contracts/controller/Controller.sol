pragma solidity ^0.4.11;

import "./Reputation.sol";
import "./MintableToken.sol";
import "../globalConstraints/GlobalConstraintInterface.sol";

contract ActionInterface {
    function action( uint _param ) returns(bool);
}

contract Controller {

    string constant public version = "0.0.1";

    struct Scheme {
      bool      registered;
      bool      registeringScheme;
      bool      upgradingScheme;
      bytes32   parametersHash;
    }

    mapping(address=>Scheme) public schemes;
    // TODO - should be iterable? UI can use events

    MintableToken   public   nativeToken;
    Reputation      public   nativeReputation;
    string          public   orgName;
    address         public   newController;
    address         public   upgradingScheme;
    bytes32         public   upgradingSchemeParams;
    address         public   globalConstraintScheme;
    bytes32         public   globalConstraintsSchemeParams;
    address[]       public   globalConstraints;
    bytes32[]       public   globalConstraintsParams;

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

  // This is a good constructor only for new organizations, need an improved one to support upgrade.
    function Controller(string _orgName,
                         string _tknName,
                         string _tknSymbol,
                         address _universalRegisteringScheme,
                         bytes32 _registeringSchemeParams,
                         address _upgradingScheme,
                         bytes32 _upgradingSchemeParams,
                         address _globalConstraintScheme,
                         bytes32 _globalConstraintsSchemeParams)
    {
        orgName = _orgName;
        nativeToken = new MintableToken(_tknName, _tknSymbol);
        nativeReputation = new Reputation();
        Scheme memory scheme;
        scheme.registered = true;
        scheme.registeringScheme = true;
        scheme.parametersHash = _registeringSchemeParams;
        schemes[_universalRegisteringScheme] = scheme;
        RegisterScheme(msg.sender, _universalRegisteringScheme);
        upgradingScheme = _upgradingScheme;
        upgradingSchemeParams = _upgradingSchemeParams;
        globalConstraintScheme = _globalConstraintScheme;
        globalConstraintsSchemeParams = _globalConstraintsSchemeParams;
    }

  // Modifieres:
    modifier onlyRegisteringSchemes() {
        require(schemes[msg.sender].registeringScheme);
        _;
    }

    modifier onlyRegisteredScheme() {
        require(schemes[msg.sender].registered);
        _;
    }

    modifier onlyGlobalConstraintScheme() {
        require(msg.sender == globalConstraintScheme);
        _;
    }

    modifier onlyUpgradingScheme() {
        require(msg.sender == upgradingScheme);
        _;
    }

    modifier onlySubjectToConstraint( string func ) {
      for (uint cnt=0; cnt<globalConstraints.length; cnt++) {
        if (globalConstraints[cnt] != address(0))
          require( (GlobalConstraintInterface(globalConstraints[cnt])).pre(msg.sender, globalConstraintsParams[cnt], bytes(func)) );
      }
      _;
      for (cnt=0; cnt<globalConstraints.length; cnt++) {
        if (globalConstraints[cnt] != address(0))
          require( (GlobalConstraintInterface(globalConstraints[cnt])).post(msg.sender, globalConstraintsParams[cnt], bytes(func)) );
      }
    }

  // Minting:
    function mintReputation(int256 _amount, address _beneficary)
      onlyRegisteredScheme onlySubjectToConstraint("mintReputation") returns(bool){
        MintReputation(msg.sender, _beneficary, _amount);
        return nativeReputation.mint(_amount, _beneficary);
    }

    function mintTokens(int256 _amount, address _beneficary)
    onlyRegisteredScheme onlySubjectToConstraint("mintTokens") returns(bool){
        MintTokens(msg.sender, _beneficary, _amount);
        return nativeToken.mint(_amount, _beneficary);
    }

  // Scheme registration and unregistration:
    function registerScheme( address _scheme, bool _registeringScheme, bytes32 _parametersHash)
    onlyRegisteringSchemes onlySubjectToConstraint("registerScheme") returns(bool){
        schemes[_scheme].registered = true;
        schemes[_scheme].registeringScheme = _registeringScheme;
        schemes[_scheme].parametersHash = _parametersHash;
        RegisterScheme(msg.sender, _scheme);
        return true;
    }

    function unregisterScheme( address _scheme )
    onlyRegisteringSchemes onlySubjectToConstraint("unregisterScheme") returns(bool){
        UnregisterScheme(msg.sender, _scheme);
        delete schemes[_scheme];
        return true;
    }

    function unregisterSelf() onlySubjectToConstraint("unregisterSelf") returns(bool){
        delete schemes[msg.sender];
        return true;
    }

    function isSchemeRegistered(address _scheme) constant returns(bool) {
      return schemes[_scheme].registered;
    }

    function getSchemeParameters(address _scheme) constant returns(bytes32) {
      return schemes[_scheme].parametersHash;
    }

  // Globol Contraints:
    function addGlobalConstraint (address _globalConstraint, bytes32 _params)
    onlyGlobalConstraintScheme onlySubjectToConstraint("addGlobalConstraint") returns(bool) {
        globalConstraints.push(_globalConstraint);
        globalConstraintsParams.push(_params);
        return true;
    }

    function removeGlobalConstraint (address _globalConstraint)
    onlyGlobalConstraintScheme onlySubjectToConstraint("removeGlobalConstraint") returns(bool) {
      for (uint cnt=0; cnt< globalConstraints.length; cnt++) {
        if (globalConstraints[cnt] == _globalConstraint) {
          globalConstraints[cnt] = address(0);
          return true;
        }
      }
    }

    function changeGlobalConstraintScheme( address _newGlobalConstraintScheme )
    onlyGlobalConstraintScheme onlySubjectToConstraint("changeGlobalConstraintScheme") returns(bool) {
        globalConstraintScheme = _newGlobalConstraintScheme;
        return true;
    }

  // Upgrading:
    function changeUpgradeScheme( address _newupgradingScheme )
    onlyUpgradingScheme returns(bool) {
        upgradingScheme = _newupgradingScheme;
        return true;
    }

    function upgradeController( address _newController )
    onlyUpgradingScheme returns(bool) {
        require(newController == address(0));   // Do we want this?
        require(_newController != address(0));
        newController = _newController;
        nativeToken.transferOwnership(_newController);
        nativeReputation.transferOwnership(_newController);
        return true;
    }

    function genericAction( ActionInterface _action, uint _param ) // TODO discuss name
    onlyRegisteredScheme onlySubjectToConstraint("genericAction") returns(bool){
        GenericAction( msg.sender, _action, _param );
        return _action.delegatecall(bytes4(sha3("action(uint256)")), _param);
    }

    function sendEther( uint _amountInWei, address _to )
    onlyRegisteredScheme onlySubjectToConstraint("sendEther") returns(bool) {
        SendEther( msg.sender, _amountInWei, _to );
        _to.transfer(_amountInWei );
        return true;
    }

    function externalTokenTransfer(StandardToken _externalToken, address _to, uint _value)
    onlyRegisteredScheme onlySubjectToConstraint("externalTokenTransfer") returns(bool) {
        ExternalTokenTransfer(msg.sender, _externalToken, _to, _value);
        _externalToken.transfer( _to, _value );
        return true;
    }

    function externalTokenTransferFrom(StandardToken _externalToken, address _from, address _to, uint _value)
    onlyRegisteredScheme onlySubjectToConstraint("externalTokenTransferFrom") returns(bool) {
        ExternalTokenTransferFrom(msg.sender, _externalToken, _from, _to, _value);
        _externalToken.transferFrom( _from, _to, _value );
        return true;
    }

    function externalTokenApprove(StandardToken _externalToken, address _spender, uint _value)
    onlyRegisteredScheme onlySubjectToConstraint("externalTokenApprove") returns(bool) {
        ExternalTokenApprove( msg.sender, _externalToken, _spender, _value );
        _externalToken.approve( _spender, _value );
        return true;
    }

    // function in case someone approved a token to the contract and changed
    // his mind. Can be called both for internal or external tokens.

    function tokenDisapprove(StandardToken _token, uint _value )
    onlySubjectToConstraint("tokenDisapprove") returns(bool) {
        TokenDisapprove( msg.sender, _token, _value );
        _token.transferFrom( msg.sender,msg.sender, _value );
        return true;
    }

    function() payable {
        Fallback( msg.sender, msg.value );
    }
}
