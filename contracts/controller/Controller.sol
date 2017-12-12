pragma solidity ^0.4.18;

import "./Avatar.sol";
import "./Reputation.sol";
import "./DAOToken.sol";
import "../globalConstraints/GlobalConstraintInterface.sol";


/**
 * @title Controller contract
 * @dev A controller controls the organizations tokens,reputation and avatar.
 * It is subject to a set of schemes and constraints that determine its behavior.
 * Each scheme has it own parameters and operation permmisions.
 */
contract Controller {

    struct Scheme {
        bytes32 paramsHash;  // a hash "configuration" of the scheme
        bytes4  permissions; // A bitwise flags of permissions,
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
    DAOToken public nativeToken;
    Reputation public nativeReputation;
  // newController will point to the new controller after the present controller is upgraded
    address public newController;
  // globalConstraints that determine pre- and post-conditions for all actions on the controller
    GlobalConstraint[] public globalConstraints;

    event MintReputation (address indexed _sender, address indexed _beneficiary, int256 _amount);
    event MintTokens (address indexed _sender, address indexed _beneficiary, uint256 _amount);
    event RegisterScheme (address indexed _sender, address indexed _scheme);
    event UnregisterScheme (address indexed _sender, address indexed _scheme);
    event GenericAction (address indexed _sender, bytes32[] _params);
    event SendEther (address indexed _sender, uint _amountInWei, address indexed _to);
    event ExternalTokenTransfer (address indexed _sender, address indexed _externalToken, address indexed _to, uint _value);
    event ExternalTokenTransferFrom (address indexed _sender, address indexed _externalToken, address _from, address _to, uint _value);
    event ExternalTokenIncreaseApproval (address indexed _sender, StandardToken indexed _externalToken, address _spender, uint _value);
    event ExternalTokenDecreaseApproval (address indexed _sender, StandardToken indexed _externalToken, address _spender, uint _value);
    event AddGlobalConstraint(address _globalconstraint, bytes32 _params);
    event RemoveGlobalConstraint(address _globalConstraint ,uint256 _index);
    event UpgradeController(address _oldController,address _newController);

    function Controller(
        Avatar _avatar,
        DAOToken _nativeToken,
        Reputation    _nativeReputation,
        address[] _schemes,
        bytes32[] _params,
        bytes4[] _permissions
    ) public
    {
        avatar = _avatar;
        nativeToken = _nativeToken;
        nativeReputation = _nativeReputation;

    // Register the schemes:
        for (uint i = 0; i < _schemes.length; i++) {
            schemes[_schemes[i]] = Scheme({paramsHash: _params[i],permissions: _permissions[i]|bytes4(1)});
            RegisterScheme(msg.sender, _schemes[i]);
        }
    }

  // Do not allow mistaken calls:
    function() public {
        revert();
    }

  // Modifiers:
    modifier onlyRegisteredScheme() {
        require(schemes[msg.sender].permissions&bytes4(1) == bytes4(1));
        _;
    }

    modifier onlyRegisteringSchemes() {
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

    modifier onlySubjectToConstraint(bytes32 func) {
        uint index;
        for (index = 0;index<globalConstraints.length;index++) {
            require((GlobalConstraintInterface(globalConstraints[index].gcAddress)).pre(msg.sender, globalConstraints[index].params, func));
        }
        _;
        for (index = 0;index<globalConstraints.length;index++) {
            require((GlobalConstraintInterface(globalConstraints[index].gcAddress)).post(msg.sender, globalConstraints[index].params, func));
        }
    }

    /**
     * @dev mint reputation .
     * @param  _amount amount of reputation to mint
     * @param _beneficiary beneficiary address
     * @return bool which represents a success
     */
    function mintReputation(int256 _amount, address _beneficiary)
    public
    onlyRegisteredScheme
    onlySubjectToConstraint("mintReputation")
    returns(bool)
    {
        MintReputation(msg.sender, _beneficiary, _amount);
        return nativeReputation.mint(_beneficiary, _amount);
    }

    /**
     * @dev mint tokens .
     * @param  _amount amount of token to mint
     * @param _beneficiary beneficiary address
     * @return bool which represents a success
     */
    function mintTokens(uint256 _amount, address _beneficiary)
    public
    onlyRegisteredScheme
    onlySubjectToConstraint("mintTokens")
    returns(bool)
    {
        MintTokens(msg.sender, _beneficiary, _amount);
        return nativeToken.mint(_beneficiary, _amount);
    }

  /**
   * @dev register a scheme
   * @param _scheme the address of the scheme
   * @param _paramsHash a hashed configuration of the usage of the scheme
   * @param _permissions the permissions the new scheme will have
   * @return bool which represents a success
   */
    function registerScheme(address _scheme, bytes32 _paramsHash, bytes4 _permissions)
    public
    onlyRegisteringSchemes
    onlySubjectToConstraint("registerScheme")
    returns(bool)
    {

        Scheme memory scheme = schemes[_scheme];

    // Check scheme has at least the permissions it is changing, and at least the current permissions:
    // Implementation is a bit messy. One must recall logic-circuits ^^

    // produces non-zero if sender does not have all of the perms that are changing between old and new
        require(bytes4(15)&(_permissions^scheme.permissions)&(~schemes[msg.sender].permissions) == bytes4(0));
    
    // produces non-zero if sender does not have all of the perms in the old scheme
        require(bytes4(15)&(scheme.permissions&(~schemes[msg.sender].permissions)) == bytes4(0));

    // Add or change the scheme:
        schemes[_scheme].paramsHash = _paramsHash;
        schemes[_scheme].permissions = _permissions|bytes4(1);
        RegisterScheme(msg.sender, _scheme);
        return true;
    }

    /**
     * @dev unregister a scheme
     * @param _scheme the address of the scheme
     * @return bool which represents a success
     */
    function unregisterScheme( address _scheme )
    public
    onlyRegisteringSchemes
    onlySubjectToConstraint("unregisterScheme")
    returns(bool)
    {
    //check if the scheme is register
        if (schemes[_scheme].permissions&bytes4(1) == bytes4(0)) {
            return false;
          }
    // Check the unregistering scheme has enough permissions:
        require(bytes4(15)&(schemes[_scheme].permissions&(~schemes[msg.sender].permissions)) == bytes4(0));

    // Unregister:
        UnregisterScheme(msg.sender, _scheme);
        delete schemes[_scheme];
        return true;
    }

    /**
     * @dev unregister the caller's scheme
     * @return bool which represents a success
     */
    function unregisterSelf() public returns(bool) {
        if (isSchemeRegistered(msg.sender) == false) {
            return false;
        }
        delete schemes[msg.sender];
        UnregisterScheme(msg.sender, msg.sender);
        return true;
    }

    function isSchemeRegistered(address _scheme) public constant returns(bool) {
        return (schemes[_scheme].permissions&bytes4(1) != bytes4(0));
    }

    function getSchemeParameters(address _scheme) public constant returns(bytes32) {
        return schemes[_scheme].paramsHash;
    }

    function getSchemePermissions(address _scheme) public constant returns(bytes4) {
        return schemes[_scheme].permissions;
    }

  // Global Contraints:
    function globalConstraintsCount() public constant returns(uint) {
        return globalConstraints.length;
    }

    /**
     * @dev add Global Constraint
     * @param _globalConstraint the address of the global constraint to be added.
     * @param _params the constraint parameters hash.
     * @return bool which represents a success
     */
    function addGlobalConstraint(address _globalConstraint, bytes32 _params)
    public onlyGlobalConstraintsScheme returns(bool)
    {
        GlobalConstraint memory gc;
        gc.gcAddress = _globalConstraint;
        gc.params = _params;
        globalConstraints.push(gc);
        AddGlobalConstraint(_globalConstraint, _params);
        return true;
    }

    /**
     * @dev remove Global Constraint
     * @param _globalConstraint the address of the global constraint to be remove.
     * @return bool which represents a success
     */
    function removeGlobalConstraint (address _globalConstraint)
    public onlyGlobalConstraintsScheme returns(bool)
    {
        for (uint index = 0 ;index<globalConstraints.length;index++) {
            if (globalConstraints[index].gcAddress == _globalConstraint) {
                if (index < globalConstraints.length-1) {
                    globalConstraints[index] = globalConstraints[globalConstraints.length-1];
                }
                globalConstraints.length--;
                RemoveGlobalConstraint(_globalConstraint,index);
                return true;
            }
        }
        return false;
    }

  /**
    * @dev upgrade the Controller
    *      The function will trigger an event 'UpgradeController'.
    * @param  _newController the address of the new controller.
    * @return bool which represents a success
    */
    function upgradeController(address _newController)
    public onlyUpgradingScheme returns(bool)
    {
        require(newController == address(0));   // so the upgrade could be done once for a contract.
        require(_newController != address(0));
        newController = _newController;
        avatar.transferOwnership(_newController);
        if (nativeToken.owner() == address(this)) {
            nativeToken.transferOwnership(_newController);
        }
        if (nativeReputation.owner() == address(this)) {
            nativeReputation.transferOwnership(_newController);
        }
        UpgradeController(this,newController);
        return true;
    }

    /**
    * @dev do a generic deligate call to the contract which called us.
    * This function use deligatecall and might expose the organization to security
    * risk. Use this function only if you really knows what you are doing.
    * @param _params the params for the call.
    * @return bool which represents success
    */
    function genericAction(bytes32[] _params)
    public
    onlyRegisteredScheme
    onlySubjectToConstraint("genericAction")
    returns(bool)
    {
        GenericAction(msg.sender, _params);
        return avatar.genericAction(msg.sender, _params);
    }

  /**
   * @dev send some ether
   * @param _amountInWei the amount of ether (in Wei) to send
   * @param _to address of the beneficary
   * @return bool which represents a success
   */
    function sendEther(uint _amountInWei, address _to)
    public
    onlyRegisteredScheme
    onlySubjectToConstraint("sendEther")
    returns(bool)
    {
        SendEther(msg.sender, _amountInWei, _to);
        return avatar.sendEther(_amountInWei, _to);
    }

    /**
    * @dev send some amount of arbitrary ERC20 Tokens
    * @param _externalToken the address of the Token Contract
    * @param _to address of the beneficary
    * @param _value the amount of ether (in Wei) to send
    * @return bool which represents a success
    */
    function externalTokenTransfer(StandardToken _externalToken, address _to, uint _value)
    public
    onlyRegisteredScheme
    onlySubjectToConstraint("externalTokenTransfer")
    returns(bool)
    {
        ExternalTokenTransfer(msg.sender, _externalToken, _to, _value);
        return avatar.externalTokenTransfer(_externalToken, _to, _value);
    }

    /**
    * @dev transfer token "from" address "to" address
    *      One must to approve the amount of tokens which can be spend from the
    *      "from" account.This can be done using externalTokenApprove.
    * @param _externalToken the address of the Token Contract
    * @param _from address of the account to send from
    * @param _to address of the beneficary
    * @param _value the amount of ether (in Wei) to send
    * @return bool which represents a success
    */
    function externalTokenTransferFrom(StandardToken _externalToken, address _from, address _to, uint _value)
    public
    onlyRegisteredScheme
    onlySubjectToConstraint("externalTokenTransferFrom")
    returns(bool)
    {
        ExternalTokenTransferFrom(msg.sender, _externalToken, _from, _to, _value);
        return avatar.externalTokenTransferFrom(_externalToken, _from, _to, _value);
    }

    /**
    * @dev increase approval for the spender address to spend a specified amount of tokens
    *      on behalf of msg.sender.
    * @param _externalToken the address of the Token Contract
    * @param _spender address
    * @param _addedValue the amount of ether (in Wei) which the approval is refering to.
    * @return bool which represents a success
    */
    function externalTokenIncreaseApproval(StandardToken _externalToken, address _spender, uint _addedValue)
    public
    onlyRegisteredScheme
    onlySubjectToConstraint("externalTokenIncreaseApproval")
    returns(bool)
    {
        ExternalTokenIncreaseApproval(msg.sender,_externalToken,_spender,_addedValue);
        return avatar.externalTokenIncreaseApproval(_externalToken, _spender, _addedValue);
    }

    /**
    * @dev decrease approval for the spender address to spend a specified amount of tokens
    *      on behalf of msg.sender.
    * @param _externalToken the address of the Token Contract
    * @param _spender address
    * @param _subtractedValue the amount of ether (in Wei) which the approval is refering to.
    * @return bool which represents a success
    */
    function externalTokenDecreaseApproval(StandardToken _externalToken, address _spender, uint _subtractedValue)
    public
    onlyRegisteredScheme
    onlySubjectToConstraint("externalTokenDecreaseApproval")
    returns(bool)
    {
        ExternalTokenDecreaseApproval(msg.sender,_externalToken,_spender,_subtractedValue);
        return avatar.externalTokenDecreaseApproval(_externalToken, _spender, _subtractedValue);
    }

}
