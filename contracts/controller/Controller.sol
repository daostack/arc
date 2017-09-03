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

    struct Scheme {
      bytes32 paramsHash; // a hash "configuration" of the scheme
      bytes4 permissions; // A bitwise flags of permissions,
                          // All 0: Not registered,
                          // 1st bit: Flag if the scheme is registered,
                          // 2nd bit: Scheme can register other schemes
                          // 3th bit: Scheme can add/remove global constraints
                          // 4rd bit: Scheme can upgrade the controller
    }

    struct GlobalConstraint {
      address gcAddress;
      bytes32 params;
    }

    mapping(address=>Scheme) public schemes;

    Avatar public avatar;
    MintableToken public nativeToken;
    Reputation public nativeReputation;
    // newController will point to the new controller after the present controller is upgraded
    address public newController;
    // globalConstraints that determine pre- and post-conditions for all actions on the controller
    GlobalConstraint[] public globalConstraints;
    /*address[] public globalConstraints;
    bytes32[] public globalConstraintsParams;*/

    event MintReputation (address indexed _sender, address indexed _beneficiary, int256 _amount);
    event MintTokens (address indexed _sender, address indexed _beneficiary, uint256 _amount);
    event RegisterScheme (address indexed _sender, address indexed _scheme);
    event UnregisterScheme (address indexed _sender, address indexed _scheme);
    event GenericAction (address indexed _sender, address indexed _action, uint _param);
    event SendEther (address indexed _sender, uint _amountInWei, address indexed _to);
    event ExternalTokenTransfer (address indexed _sender, address indexed _externalToken, address indexed _to, uint _value);
    event ExternalTokenTransferFrom (address indexed _sender, address indexed _externalToken, address _from, address _to, uint _value);
    event ExternalTokenApprove (address indexed _sender, StandardToken indexed _externalToken, address _spender, uint _value);
    event LogAddGlobalConstraint(address _globalconstraint, bytes32 _params);

    // This is a good constructor only for new organizations, need an improved one to support upgrade.
    function Controller(
        Avatar _avatar,
        MintableToken _nativeToken,
        Reputation    _nativeReputation,
        address[] _schemes,
        bytes32[] _params,
        bytes4[] _permissions
    ) {
        avatar = _avatar;
        nativeToken = _nativeToken;
        nativeReputation = _nativeReputation;

        // Register the schemes:
        for (uint i = 0; i < _schemes.length; i++) {
            schemes[_schemes[i]].paramsHash = _params[i];
            schemes[_schemes[i]].permissions = _permissions[i];
            RegisterScheme(msg.sender, _schemes[i]);
        }
    }

    // Modifiers:
    modifier onlyRegisteredScheme() {
      require(schemes[msg.sender].permissions != bytes4(0));
      _;
    }

    modifier onlyRegisteringSchemes() {
        /*require(uint(schemes[msg.sender].permissions) > 1);*/
        require(schemes[msg.sender].permissions&bytes4(2) == bytes4(2));
        _;
    }

    modifier onlyGlobalConstraintsScheme() {
        require(schemes[msg.sender].permissions&bytes4(4) == bytes4(4));
        _;
    }

    modifier onlyUpgradingScheme() {
        require(schemes[msg.sender].permissions&bytes4(8) == bytes4(8));
        _;
    }

    // TODO: XXX: Constraints are commented due to gas issues, must fix.
    modifier onlySubjectToConstraint(bytes32 func) {
      /*for (uint cnt=0; cnt<globalConstraints.length; cnt++) {
        if (globalConstraints[cnt].gcAddress != address(0))
        require( (GlobalConstraintInterface(globalConstraints[cnt].gcAddress)).pre(msg.sender, globalConstraints[cnt].params, func) );
      }*/
      _;
      /*for (uint cnt=0; cnt<globalConstraints.length; cnt++) {
        if (globalConstraints[cnt].gcAddress != address(0))
        require( (GlobalConstraintInterface(globalConstraints[cnt].gcAddress)).post(msg.sender, globalConstraints[cnt].params, func) );
      }*/
    }

    // Minting:
    function mintReputation(int256 _amount, address _beneficiary)
        onlyRegisteredScheme
        onlySubjectToConstraint("mintReputation")
        returns(bool)
        {
        MintReputation(msg.sender, _beneficiary, _amount);
        return nativeReputation.mint(_amount, _beneficiary);
    }

    function mintTokens(uint256 _amount, address _beneficiary)
        onlyRegisteredScheme
        onlySubjectToConstraint("mintTokens")
        returns(bool)
    {
        MintTokens(msg.sender, _beneficiary, _amount);
        return nativeToken.mint(_amount, _beneficiary);
    }

    /**
     * @dev register a scheme
     * @param _scheme the address of the scheme
     * @param _paramsHash a hashed configuration of the usage of the scheme
     * @param _permissions the permissions the new scheme will have
     */
    function registerScheme(address _scheme, bytes32 _paramsHash, bytes4 _permissions)
        onlyRegisteringSchemes
        onlySubjectToConstraint("registerScheme")
        returns(bool)
        {

        Scheme memory scheme = schemes[_scheme];

        // Check scheme has at least the permissions it is changing, and at least the current permissions:
        // Implementation is a bit messy. One must recall logic-circuits ^^
        require(bytes4(15)&(_permissions^scheme.permissions)&(~schemes[msg.sender].permissions) == bytes4(0));
        require(bytes4(15)&(scheme.permissions&(~schemes[msg.sender].permissions)) == bytes4(0));

        // Add or change the scheme:
        schemes[_scheme].paramsHash = _paramsHash;
        schemes[_scheme].permissions = _permissions;
        RegisterScheme(msg.sender, _scheme);
        return true;
    }

    function unregisterScheme( address _scheme )
        onlyRegisteringSchemes
        onlySubjectToConstraint("unregisterScheme")
        returns(bool)
    {
        // Check the unregistering scheme has enough permissions:
        require(bytes4(15)&(schemes[_scheme].permissions&(~schemes[msg.sender].permissions)) == bytes4(0));

        // Unregister:
        UnregisterScheme(msg.sender, _scheme);
        delete schemes[_scheme];
        return true;
    }

    function unregisterSelf() returns(bool) {
        delete schemes[msg.sender];
        return true;
    }

    function isSchemeRegistered(address _scheme) constant returns(bool) {
        return (schemes[_scheme].permissions != 0);
    }

    function getSchemeParameters(address _scheme) constant returns(bytes32) {
        return schemes[_scheme].paramsHash;
    }

    function getSchemePermissions(address _scheme) constant returns(bytes4) {
        return schemes[_scheme].permissions;
    }

    // Global Contraints:
    function globalConstraintsCount() constant returns(uint) {
        return globalConstraints.length;
    }

    function addGlobalConstraint(address _globalConstraint, bytes32 _params)
        onlyGlobalConstraintsScheme
        returns(bool)
        {
        GlobalConstraint memory gc;
        gc.gcAddress = _globalConstraint;
        gc.params = _params;
        globalConstraints.push(gc);
        LogAddGlobalConstraint(_globalConstraint, _params);
        return true;
    }

    function removeGlobalConstraint (address _globalConstraint)
        onlyGlobalConstraintsScheme
        returns(bool)
    {
        for (uint cnt=0; cnt<globalConstraints.length; cnt++) {
            if (globalConstraints[cnt].gcAddress == _globalConstraint) {
                globalConstraints[cnt].gcAddress = address(0);
                return true;
            }
        }
    }

    // Upgrading:
    function upgradeController(address _newController)
        onlyUpgradingScheme returns(bool)
    {
        require(newController == address(0));   // Do we want this?
        require(_newController != address(0));
        newController = _newController;
        avatar.transferOwnership(_newController);
        nativeToken.transferOwnership(_newController);
        nativeReputation.transferOwnership(_newController);
        return true;
    }

    // External actions:
    function genericAction(ActionInterface _action, uint _param)
        onlyRegisteredScheme
        onlySubjectToConstraint("genericAction")
        returns(bool)
    {
        GenericAction( msg.sender, _action, _param );
        return avatar.genericAction(_action, _param);
    }

    /**
     * @dev send some ether
     * @param _amountInWei the amount of ether (in Wei) to send
     * @param _to address of the beneficary
     */
    function sendEther(uint _amountInWei, address _to)
        onlyRegisteredScheme
        onlySubjectToConstraint("sendEther")
        returns(bool)
    {
        SendEther( msg.sender, _amountInWei, _to );
        return avatar.sendEther(_amountInWei, _to);
    }

    /**
     * @dev send some amount of arbitrary ERC20 Tokens
     * @param _externalToken the address of the Token Contract
     * @param _to address of the beneficary
     * @param _value the amount of ether (in Wei) to send
     */
    function externalTokenTransfer(StandardToken _externalToken, address _to, uint _value)
        onlyRegisteredScheme
        onlySubjectToConstraint("externalTokenTransfer")
        returns(bool)
    {
        ExternalTokenTransfer(msg.sender, _externalToken, _to, _value);
        return avatar.externalTokenTransfer(_externalToken, _to, _value);
    }

    function externalTokenTransferFrom(StandardToken _externalToken, address _from, address _to, uint _value)
        onlyRegisteredScheme
        onlySubjectToConstraint("externalTokenTransferFrom")
        returns(bool)
    {
        ExternalTokenTransferFrom(msg.sender, _externalToken, _from, _to, _value);
        return avatar.externalTokenTransferFrom(_externalToken, _from, _to, _value);
    }

    function externalTokenApprove(StandardToken _externalToken, address _spender, uint _value)
        onlyRegisteredScheme
        onlySubjectToConstraint("externalTokenApprove")
        returns(bool)
    {
        ExternalTokenApprove( msg.sender, _externalToken, _spender, _value );
        return avatar.externalTokenApprove(_externalToken, _spender, _value );
    }

    // Do not allow mistaken calls:
    function() {
        revert();
    }
}
