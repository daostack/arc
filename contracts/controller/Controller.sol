pragma solidity ^0.4.24;

import "./Avatar.sol";
import "../constraints/ConstraintInterface.sol";
import "./ControllerInterface.sol";


/**
 * @title Controller contract
 * @dev A controller controls the organizations tokens, reputation and avatar.
 * It is subject to a set of schemes and constraints that determine its behavior.
 * Each scheme has defined operation permissions.
 */
contract Controller is ControllerInterface {

    struct ConstraintData {
        bool isRegistered;
        ConstraintInterface.CallPhase when;
        uint idx;
    }

    mapping(address => bytes4) schemes; // A bitwise flags of permissions,
                                        // All 0: Not registered,
                                        // 1st bit: Flag if the scheme is registered,
                                        // 2nd bit: Scheme can register other schemes
                                        // 3rd bit: Scheme can add/remove constraints
                                        // 4th bit: Scheme can upgrade the controller
                                        // 5th bit: Scheme can call genericCall on behalf of
                                        //          the organization avatar

    Avatar public avatar;
    DAOToken public nativeToken;
    Reputation public nativeReputation;
    // newController will point to the new controller after the present controller is upgraded
    address public newController;
    // constraints that determine pre conditions for all actions on the controller
    address[] public constraintsPre;
    // constraints that determine post conditions for all actions on the controller
    address[] public constraintsPost;
    // is an address registered as a constraint
    mapping(address => ConstraintData) registeredConstraints;
    address[] constraints;
    uint removedConstraintsCount;

    event MintReputation(address indexed _sender, address indexed _to, uint256 _amount);
    event BurnReputation(address indexed _sender, address indexed _from, uint256 _amount);
    event MintTokens(address indexed _sender, address indexed _beneficiary, uint256 _amount);
    event RegisterScheme(address indexed _sender, address indexed _scheme);
    event UnregisterScheme(address indexed _sender, address indexed _scheme);
    event UpgradeController(address indexed _oldController,address _newController);
    event AddConstraint(address indexed _constraint, ConstraintInterface.CallPhase _when);
    event RemoveConstraint(address indexed _constraint, uint _idx, bool _isPre); // TODO: is `_isPre` necessary?

    constructor() public {
        avatar = Avatar(0x000000000000000000000000000000000000dead);
    }

    // Do not allow mistaken calls:
    function() external {
        revert("Fallback function blocked");
    }

    function init(address creator, Avatar _avatar) external {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");

        avatar = _avatar;
        nativeToken = avatar.nativeToken();
        nativeReputation = avatar.nativeReputation();
        schemes[creator] = bytes4(0x1F);
    }

  // Modifiers:
    modifier onlyRegisteredScheme() {
        require(
            schemes[msg.sender]&bytes4(1) == bytes4(1),
            "Scheme don't have the premission to trigger this action"
        );
        _;
    }

    modifier onlyRegisteringSchemes() {
        require(
            schemes[msg.sender]&bytes4(2) == bytes4(2),
            "Scheme don't have the premission to trigger this action"
        );
        _;
    }

    modifier onlyConstraintsScheme() {
        require(
            schemes[msg.sender]&bytes4(4) == bytes4(4),
            "Scheme don't have the premission to trigger this action"
        );
        _;
    }

    modifier onlyUpgradingScheme() {
        require(
            schemes[msg.sender]&bytes4(8) == bytes4(8),
            "Scheme don't have the premission to trigger this action"
        );
        _;
    }

    modifier onlyGenericCallScheme() {
        require(
            schemes[msg.sender]&bytes4(16) == bytes4(16),
            "Scheme don't have the premission to trigger this action"
        );
        _;
    }

    modifier onlySubjectToConstraint(bytes32 func) {
        uint idx;
        for (idx = 0; idx < constraints.length; idx++) {
            if (registeredConstraints[constraints[idx]].when != ConstraintInterface.CallPhase.Post) {
                require(
                    ConstraintInterface(constraints[idx]).pre(msg.sender, func),
                    "Failed to satisfy constraint (pre)"
                );
            }
        }
        
        _;

        for (idx = 0; idx < constraints.length; idx++) {
            if (registeredConstraints[constraints[idx]].when != ConstraintInterface.CallPhase.Pre) {
                require(
                    ConstraintInterface(constraints[idx]).post(msg.sender, func),
                    "Failed to satisfy constraint (pre)"
                );
            }
        }
    }

    /**
     * @dev Mint `_amount` of reputation that are assigned to `_to` .
     * @param  _amount amount of reputation to mint
     * @param _to beneficiary address
     * @return bool which represents a success
     */
    function mintReputation(uint256 _amount, address _to)
    external
    onlyRegisteredScheme
    onlySubjectToConstraint("mintReputation")
    returns(bool)
    {
        emit MintReputation(msg.sender, _to, _amount);
        return nativeReputation.mint(_to, _amount);
    }

    /**
     * @dev Burns `_amount` of reputation from `_from`
     * @param _amount amount of reputation to burn
     * @param _from The address that will lose the reputation
     * @return bool which represents a success
     */
    function burnReputation(uint256 _amount, address _from)
    external
    onlyRegisteredScheme
    onlySubjectToConstraint("burnReputation")
    returns(bool)
    {
        emit BurnReputation(msg.sender, _from, _amount);
        return nativeReputation.burn(_from, _amount);
    }

    /**
     * @dev mint tokens .
     * @param  _amount amount of token to mint
     * @param _beneficiary beneficiary address
     * @return bool which represents a success
     */
    function mintTokens(uint256 _amount, address _beneficiary)
    external
    onlyRegisteredScheme
    onlySubjectToConstraint("mintTokens")
    returns(bool)
    {
        emit MintTokens(msg.sender, _beneficiary, _amount);
        return nativeToken.mint(_beneficiary, _amount);
    }

  /**
   * @dev register a scheme
   * @param _scheme the address of the scheme
   * @param _permissions the permissions the new scheme will have
   * @return bool which represents a success
   */
    function registerScheme(address _scheme, bytes4 _permissions)
    external
    onlyRegisteringSchemes
    onlySubjectToConstraint("registerScheme")
    returns(bool)
    {

        bytes4 permissions = schemes[_scheme];

        // Check scheme has at least the permissions it is changing, and at least the current permissions:
        // Implementation is a bit messy. One must recall logic-circuits ^^

        // produces non-zero if sender does not have all of the perms that are changing between old and new
        require(
            bytes4(0x1F) & (_permissions ^ permissions) & (~schemes[msg.sender]) == bytes4(0),
            "Registering scheme doesn't have enough permissions"
        );

        // produces non-zero if sender does not have all of the perms in the old scheme
        require(
            bytes4(0x1F) & (permissions & (~schemes[msg.sender])) == bytes4(0),
            "Caller scheme doesn't have have permissions in registering scheme"
        );

        // Add or change the scheme:
        schemes[_scheme] = _permissions | bytes4(1);
        emit RegisterScheme(msg.sender, _scheme);
        return true;
    }

    /**
     * @dev unregister a scheme
     * @param _scheme the address of the scheme
     * @return bool which represents a success
     */
    function unregisterScheme(address _scheme)
    external
    onlyRegisteringSchemes
    onlySubjectToConstraint("unregisterScheme")
    returns(bool)
    {
        // Check if the scheme is registered
        if (schemes[_scheme] & bytes4(1) == bytes4(0)) {
            return false;
        }
        
        // Check the unregistering scheme has enough permissions:
        require(
            bytes4(0x1F) & (schemes[_scheme] & (~schemes[msg.sender])) == bytes4(0),
            "Unregistering scheme doesn't have enough permissions"
        );

        // Unregister:
        emit UnregisterScheme(msg.sender, _scheme);
        
        delete schemes[_scheme];
        
        return true;
    }

    /**
     * @dev unregister the caller's scheme
     * @return bool which represents a success
     */
    function unregisterSelf() external returns(bool) {
        if (_isSchemeRegistered(msg.sender) == false) {
            return false;
        }

        delete schemes[msg.sender];

        emit UnregisterScheme(msg.sender, msg.sender);

        return true;
    }

    function isSchemeRegistered(address _scheme) external view returns(bool) {
        return _isSchemeRegistered(_scheme);
    }

    function getSchemePermissions(address _scheme) external view returns(bytes4) {
        return schemes[_scheme];
    }

    /**
     * @dev constraintsCount return the constraints pre and post count
     * @return uint constraints count.
     */
    function constraintsCount() external view returns(uint) {
        return constraints.length - removedConstraintsCount;
    }

    function isConstraintRegistered(address _constraint) external view returns(bool) {
        return registeredConstraints[_constraint].isRegistered;
    }

    /**
     * @dev add or update constraint
     * @param _constraint the address of the constraint to be added.
     * @return bool which represents a success
     */
    function addConstraint(address _constraint) external onlyConstraintsScheme returns(bool) {
        require(!registeredConstraints[_constraint].isRegistered, "Constraint already registered");

        ConstraintInterface.CallPhase when = ConstraintInterface(_constraint).when();

        registeredConstraints[_constraint] = ConstraintData(true, when, constraints.length);

        constraints.push(_constraint); 

        emit AddConstraint(_constraint, when);

        return true;
    }

    /**
     * @dev remove constraint
     * @param _constraint the address of the constraint to be remove.
     * @return bool which represents a success
     */
    function removeConstraint(address _constraint)
    external
    onlyConstraintsScheme
    returns(bool)
    {
        ConstraintInterface.CallPhase when = ConstraintInterface(_constraint).when();
        
        require(registeredConstraints[_constraint].isRegistered, "Constraint is not registered");

        constraints[registeredConstraints[_constraint].idx] = address(0);
        
        emit RemoveConstraint(_constraint, registeredConstraints[_constraint].idx, when == ConstraintInterface.CallPhase.Pre);

        delete registeredConstraints[_constraint];

        removedConstraintsCount++;

        return true;
    }

  /**
    * @dev upgrade the Controller
    *      The function will trigger an event 'UpgradeController'.
    * @param  _newController the address of the new controller.
    * @return bool which represents a success
    */
    function upgradeController(address _newController)
    external
    onlyUpgradingScheme
    returns(bool)
    {
        require(newController == address(0));   // so the upgrade could be done once for a contract.
        require(_newController != address(0));
        newController = _newController;
        avatar.transferOwnership(_newController);
        require(avatar.owner()==_newController);
        if (nativeToken.owner() == address(this)) {
            nativeToken.transferOwnership(_newController);
            require(nativeToken.owner()==_newController);
        }
        if (nativeReputation.owner() == address(this)) {
            nativeReputation.transferOwnership(_newController);
            require(nativeReputation.owner()==_newController);
        }
        emit UpgradeController(this,newController);
        return true;
    }

    /**
    * @dev perform a generic call to an arbitrary contract
    * @param _contract  the contract's address to call
    * @param _data ABI-encoded contract call to call `_contract` address.
    * @return bytes32  - the return value of the called _contract's function.
    */
    function genericCall(address _contract,bytes _data)
    external
    onlyGenericCallScheme
    onlySubjectToConstraint("genericCall")
    returns (bytes32 returnValue)
    {
        avatar.genericCall(_contract, _data);
        // solium-disable-next-line security/no-inline-assembly
        assembly {
        // Copy the returned data.
        returndatacopy(returnValue, 0, returndatasize)
        return(returnValue, 0x20)
        }
    }

  /**
   * @dev send some ether
   * @param _amountInWei the amount of ether (in Wei) to send
   * @param _to address of the beneficiary
   * @return bool which represents a success
   */
    function sendEther(uint _amountInWei, address _to)
    external
    onlyRegisteredScheme
    onlySubjectToConstraint("sendEther")
    returns(bool)
    {
        return avatar.sendEther(_amountInWei, _to);
    }

    /**
    * @dev send some amount of arbitrary ERC20 Tokens
    * @param _externalToken the address of the Token Contract
    * @param _to address of the beneficiary
    * @param _value the amount of ether (in Wei) to send
    * @return bool which represents a success
    */
    function externalTokenTransfer(StandardToken _externalToken, address _to, uint _value)
    external
    onlyRegisteredScheme
    onlySubjectToConstraint("externalTokenTransfer")
    returns(bool)
    {
        return avatar.externalTokenTransfer(_externalToken, _to, _value);
    }

    /**
    * @dev transfer token "from" address "to" address
    *      One must to approve the amount of tokens which can be spend from the
    *      "from" account.This can be done using externalTokenApprove.
    * @param _externalToken the address of the Token Contract
    * @param _from address of the account to send from
    * @param _to address of the beneficiary
    * @param _value the amount of ether (in Wei) to send
    * @return bool which represents a success
    */
    function externalTokenTransferFrom(StandardToken _externalToken, address _from, address _to, uint _value)
    external
    onlyRegisteredScheme
    onlySubjectToConstraint("externalTokenTransferFrom")
    returns(bool)
    {
        return avatar.externalTokenTransferFrom(_externalToken, _from, _to, _value);
    }

    /**
    * @dev increase approval for the spender address to spend a specified amount of tokens
    *      on behalf of msg.sender.
    * @param _externalToken the address of the Token Contract
    * @param _spender address
    * @param _addedValue the amount of ether (in Wei) which the approval is referring to.
    * @return bool which represents a success
    */
    function externalTokenIncreaseApproval(StandardToken _externalToken, address _spender, uint _addedValue)
    external
    onlyRegisteredScheme
    onlySubjectToConstraint("externalTokenIncreaseApproval")
    returns(bool)
    {
        return avatar.externalTokenIncreaseApproval(_externalToken, _spender, _addedValue);
    }

    /**
    * @dev decrease approval for the spender address to spend a specified amount of tokens
    *      on behalf of msg.sender.
    * @param _externalToken the address of the Token Contract
    * @param _spender address
    * @param _subtractedValue the amount of ether (in Wei) which the approval is referring to.
    * @return bool which represents a success
    */
    function externalTokenDecreaseApproval(StandardToken _externalToken, address _spender, uint _subtractedValue)
    external
    onlyRegisteredScheme
    onlySubjectToConstraint("externalTokenDecreaseApproval")
    returns(bool)
    {
        return avatar.externalTokenDecreaseApproval(_externalToken, _spender, _subtractedValue);
    }

    /**
     * @dev getNativeReputation
     * @return organization native reputation
     */
    function getNativeReputation() external view returns(address) {
        return address(nativeReputation);
    }

    function _isSchemeRegistered(address _scheme) private view returns(bool) {
        return (schemes[_scheme] & bytes4(1) != bytes4(0));
    }
}
