pragma solidity ^0.4.11;

import "./Avatar.sol";
import "./Reputation.sol";
import "./MintableToken.sol";
import "../globalConstraints/GlobalConstraintInterface.sol";

/**
 * @title Controller contract
 * @dev A controller controls its own and other tokens, and is piloted by a reputation
 * system. It is subject to a number of constraints that determine its behavior
 */
contract Controller {

    string constant public version = "0.0.1";

    // TODO: "registered" is always true - remove it?
    struct Scheme {
      bool      registered; // TODO: rename isRegistered
      bool      registeringScheme; // TODO: rename isRegisteringScheme
      bytes32   parametersHash; // a hash "configuration" of the scheme
    }

    mapping(address=>Scheme) public schemes;

    Avatar          public   avatar;
    MintableToken   public   nativeToken;
    Reputation      public   nativeReputation;
    // newController will point to the new controller after the present controller is upgraded
    address         public   newController;
    // upgradeScheme and upgradingSchemeParams determine the conditions under which the controller 
    // can be upgraded
    address         public   upgradingScheme;
    bytes32         public   upgradingSchemeParams;
    // globalConstraintsScheme and globalConstraintsParams determine the conditions under 
    // which globalConstraints can be set
    address         public   globalConstraintsScheme;
    bytes32         public   globalConstraintsSchemeParams;
    // globalConstraints that determine pre- and post-conditions for all actions on the controller
    address[]       public   globalConstraints;
    bytes32[]       public   globalConstraintsParams;

    event MintReputation( address indexed _sender, address indexed _beneficary, int256 _amount );
    event MintTokens( address indexed _sender, address indexed _beneficary, uint256 _amount );
    event RegisterScheme( address indexed _sender, address indexed _scheme );
    event UnregisterScheme( address indexed _sender, address indexed _scheme );
    event GenericAction( address indexed _sender, address indexed _action, uint _param );

    event SendEther( address indexed _sender, uint _amountInWei, address indexed _to );
    event ReceiveEther(address indexed _sender, uint _value);
    event ExternalTokenTransfer(address indexed _sender, address indexed _externalToken, address indexed _to, uint _value);
    event ExternalTokenTransferFrom(address indexed _sender, address indexed _externalToken, address _from, address _to, uint _value);
    event ExternalTokenApprove(address indexed _sender, StandardToken indexed _externalToken, address _spender, uint _value);

    // This is a good constructor only for new organizations, need an improved one to support upgrade.
    function Controller(
        Avatar _avatar,
        MintableToken _nativeToken,
        Reputation    _nativeReputation,
        address _universalRegisteringScheme,
        bytes32 _registeringSchemeParams,
        address _upgradingScheme,
        bytes32 _upgradingSchemeParams,
        address _globalConstraintsScheme,
        bytes32 _globalConstraintsSchemeParams
    ) {
        avatar = _avatar;
        nativeToken = _nativeToken;
        nativeReputation = _nativeReputation;
        Scheme memory scheme;
        scheme.registered = true;
        scheme.registeringScheme = true;
        scheme.parametersHash = _registeringSchemeParams;
        schemes[_universalRegisteringScheme] = scheme;
        RegisterScheme(msg.sender, _universalRegisteringScheme);
        upgradingScheme = _upgradingScheme;
        upgradingSchemeParams = _upgradingSchemeParams;
        globalConstraintsScheme = _globalConstraintsScheme;
        globalConstraintsSchemeParams = _globalConstraintsSchemeParams;
    }

    // Modifiers:
    modifier onlyRegisteringSchemes() {
        require(schemes[msg.sender].registeringScheme);
        _;
    }

    modifier onlyRegisteredScheme() {
        require(schemes[msg.sender].registered);
        _;
    }

    modifier onlyglobalConstraintsScheme() {
        require(msg.sender == globalConstraintsScheme);
        _;
    }

    modifier onlyUpgradingScheme() {
        require(msg.sender == upgradingScheme);
        _;
    }

    modifier onlySubjectToConstraint(bytes32 func) {
      /*for (uint cnt=0; cnt<globalConstraints.length; cnt++) {
        if (globalConstraints[cnt] != address(0))
        require( (GlobalConstraintInterface(globalConstraints[cnt])).pre(msg.sender, globalConstraintsParams[cnt], func) );
      }*/
      _;
      for (uint cnt=0; cnt<globalConstraints.length; cnt++) {
        if (globalConstraints[cnt] != address(0))
        require( (GlobalConstraintInterface(globalConstraints[cnt])).post(msg.sender, globalConstraintsParams[cnt], func) );
      }
    }

    // Minting:
    function mintReputation(int256 _amount, address _beneficary)
      onlyRegisteredScheme onlySubjectToConstraint("mintReputation") returns(bool){
        MintReputation(msg.sender, _beneficary, _amount);
        return nativeReputation.mint(_amount, _beneficary);
    }

    function mintTokens(uint256 _amount, address _beneficary)
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

    function unregisterSelf() returns(bool){
        delete schemes[msg.sender];
        return true;
    }

    function isSchemeRegistered(address _scheme) constant returns(bool) {
      return schemes[_scheme].registered;
    }

    function getSchemeParameters(address _scheme) constant returns(bytes32) {
      return schemes[_scheme].parametersHash;
    }

    // Global Contraints:
    function addGlobalConstraint (address _globalConstraint, bytes32 _params)
    onlyglobalConstraintsScheme returns(bool) {
        globalConstraints.push(_globalConstraint);
        globalConstraintsParams.push(_params);
        return true;
    }

    function removeGlobalConstraint (address _globalConstraint)
    onlyglobalConstraintsScheme returns(bool) {
      for (uint cnt=0; cnt< globalConstraints.length; cnt++) {
        if (globalConstraints[cnt] == _globalConstraint) {
          globalConstraints[cnt] = address(0);
          return true;
        }
      }
    }

    function changeGlobalConstraintsScheme( address _newGlobalConstraintsScheme,  bytes32 _newGlobalConstraintsSchemeParams)
    onlyglobalConstraintsScheme returns(bool) {
        globalConstraintsScheme = _newGlobalConstraintsScheme;
        globalConstraintsSchemeParams = _newGlobalConstraintsSchemeParams;
        return true;
    }

  // Upgrading:
    function changeUpgradeScheme( address _newupgradingScheme, bytes32 _newParams )
    onlyUpgradingScheme returns(bool) {
        upgradingScheme = _newupgradingScheme;
        upgradingSchemeParams = _newParams;
        return true;
    }

    function upgradeController( address _newController )
    onlyUpgradingScheme returns(bool) {
        require(newController == address(0));   // Do we want this?
        require(_newController != address(0));
        newController = _newController;
        avatar.transferOwnership(_newController);
        nativeToken.transferOwnership(_newController);
        nativeReputation.transferOwnership(_newController);
        return true;
    }

  // External actions:
    function genericAction( ActionInterface _action, uint _param ) // TODO discuss name
    onlyRegisteredScheme onlySubjectToConstraint("genericAction") returns(bool){
        GenericAction( msg.sender, _action, _param );
        return avatar.genericAction(_action, _param);
    }

    function sendEther( uint _amountInWei, address _to )
    onlyRegisteredScheme onlySubjectToConstraint("sendEther") returns(bool) {
        SendEther( msg.sender, _amountInWei, _to );
        avatar.sendEther(_amountInWei, _to);
        return true;
    }

    function externalTokenTransfer(StandardToken _externalToken, address _to, uint _value)
    onlyRegisteredScheme onlySubjectToConstraint("externalTokenTransfer") returns(bool) {
        ExternalTokenTransfer(msg.sender, _externalToken, _to, _value);
        avatar.externalTokenTransfer(_externalToken, _to, _value);
        return true;
    }

    function externalTokenTransferFrom(StandardToken _externalToken, address _from, address _to, uint _value)
    onlyRegisteredScheme onlySubjectToConstraint("externalTokenTransferFrom") returns(bool) {
        ExternalTokenTransferFrom(msg.sender, _externalToken, _from, _to, _value);
        avatar.externalTokenTransferFrom(_externalToken, _from, _to, _value);
        return true;
    }

    function externalTokenApprove(StandardToken _externalToken, address _spender, uint _value)
    onlyRegisteredScheme onlySubjectToConstraint("externalTokenApprove") returns(bool) {
        ExternalTokenApprove( msg.sender, _externalToken, _spender, _value );
        _externalToken.approve( _spender, _value );
        return true;
    }

    function() payable {
        ReceiveEther( msg.sender, msg.value );
        avatar.transfer(msg.value);
    }
}
