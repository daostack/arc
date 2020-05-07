pragma solidity ^0.5.17;

import "./Avatar.sol";
import "../globalConstraints/GlobalConstraintInterface.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";


/**
 * @title Controller contract
 * @dev A controller controls the organizations tokens, reputation and avatar.
 * It is subject to a set of schemes and constraints that determine its behavior.
 */
contract Controller is Initializable {

    struct GlobalConstraintRegister {
        bool isRegistered; //is registered
        uint256 index;    //index at globalConstraints
    }

    // A bitwise flags of permissions,
                         // All 0: Not registered,
                         // 1st bit: Flag if the scheme is registered,
                         // 2nd bit: Scheme can register other schemes
                         // 3rd bit: Scheme can add/remove global constraints
                         // 4th bit: Scheme can upgrade the controller
                         // 5th bit: Scheme can call genericCall on behalf of
                         //          the organization avatar
    mapping(address=>bytes4) public schemesPermissions;

    Avatar public avatar;
    DAOToken public nativeToken;
    Reputation public nativeReputation;
  // newController will point to the new controller after the present controller is upgraded
    address public newController;
  // globalConstraintsPre that determine pre conditions for all actions on the controller

    address[] public globalConstraintsPre;
  // globalConstraintsPost that determine post conditions for all actions on the controller
    address[] public globalConstraintsPost;
  // globalConstraintsRegisterPre indicate if a globalConstraints is registered as a pre global constraint
    mapping(address=>GlobalConstraintRegister) public globalConstraintsRegisterPre;
  // globalConstraintsRegisterPost indicate if a globalConstraints is registered as a post global constraint
    mapping(address=>GlobalConstraintRegister) public globalConstraintsRegisterPost;

    event MintReputation (address indexed _sender, address indexed _to, uint256 _amount);
    event BurnReputation (address indexed _sender, address indexed _from, uint256 _amount);
    event MintTokens (address indexed _sender, address indexed _beneficiary, uint256 _amount);
    event RegisterScheme (address indexed _sender, address indexed _scheme);
    event UnregisterScheme (address indexed _sender, address indexed _scheme);
    event UpgradeController(address indexed _oldController, address _newController);

    event AddGlobalConstraint(
        address indexed _globalConstraint,
        GlobalConstraintInterface.CallPhase _when);

    event RemoveGlobalConstraint(address indexed _globalConstraint, uint256 _index, bool _isPre);

    function initialize( Avatar _avatar, address initialScheme ) external initializer {
        avatar = _avatar;
        nativeToken = avatar.nativeToken();
        nativeReputation = avatar.nativeReputation();
        schemesPermissions[initialScheme] = bytes4(0x0000001F);
        emit RegisterScheme(msg.sender, initialScheme);
    }

  // Modifiers:
    modifier onlyRegisteredScheme() {
        require(schemesPermissions[msg.sender]&bytes4(0x00000001) == bytes4(0x00000001),
        "sender is not registered scheme");
        _;
    }

    modifier onlyRegisteringSchemes() {
        require(schemesPermissions[msg.sender]&bytes4(0x00000002) == bytes4(0x00000002),
        "sender unautorized to register scheme");
        _;
    }

    modifier onlyGlobalConstraintsScheme() {
        require(schemesPermissions[msg.sender]&bytes4(0x00000004) == bytes4(0x00000004),
        "sender is not globalConstraint scheme");
        _;
    }

    modifier onlyUpgradingScheme() {
        require(schemesPermissions[msg.sender]&bytes4(0x00000008) == bytes4(0x00000008),
        "sender is not UpgradingScheme");
        _;
    }

    modifier onlyGenericCallScheme() {
        require(schemesPermissions[msg.sender]&bytes4(0x00000010) == bytes4(0x00000010),
        "sender is not a Generic Scheme");
        _;
    }

    modifier onlyMetaDataScheme() {
        require(schemesPermissions[msg.sender]&bytes4(0x00000010) == bytes4(0x00000010),
        "sender is not a MetaData Scheme");
        _;
    }

    modifier onlySubjectToConstraint(bytes32 func) {
        uint256 idx;
        for (idx = 0; idx < globalConstraintsPre.length; idx++) {
            require(
            (GlobalConstraintInterface(globalConstraintsPre[idx]))
            .pre(msg.sender, func), "not allowed by globalConstraint");
        }
        _;
        for (idx = 0; idx < globalConstraintsPost.length; idx++) {
            require(
            (GlobalConstraintInterface(globalConstraintsPost[idx]))
            .post(msg.sender, func), "not allowed by globalConstraint");
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

        bytes4 permissions = schemesPermissions[_scheme];

    // Check scheme has at least the permissions it is changing, and at least the current permissions:
    // Implementation is a bit messy. One must recall logic-circuits ^^

    // produces non-zero if sender does not have all of the perms that are changing between old and new
        require(bytes4(0x0000001f)&(_permissions^permissions)&(~schemesPermissions[msg.sender]) == bytes4(0),
        "sender unautorize to register scheme");

    // produces non-zero if sender does not have all of the perms in the old scheme
        require(bytes4(0x0000001f)&(permissions&(~schemesPermissions[msg.sender])) == bytes4(0),
        "sender unautorize to register scheme");

    // Add or change the scheme:
        schemesPermissions[_scheme] = _permissions|bytes4(0x00000001);
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
    //check if the scheme is registered
        if (_isSchemeRegistered(_scheme) == false) {
            return false;
        }
    // Check the unregistering scheme has enough permissions:
        require(bytes4(0x0000001f)&(schemesPermissions[_scheme]&(~schemesPermissions[msg.sender])) == bytes4(0),
        "sender unautorized to unregister scheme");

    // Unregister:
        emit UnregisterScheme(msg.sender, _scheme);
        delete schemesPermissions[_scheme];
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
        delete schemesPermissions[msg.sender];
        emit UnregisterScheme(msg.sender, msg.sender);
        return true;
    }

    /**
     * @dev add or update Global Constraint
     * @param _globalConstraint the address of the global constraint to be added.
     * @return bool which represents a success
     */
    function addGlobalConstraint(address _globalConstraint)
    external
    onlyGlobalConstraintsScheme
    returns(bool)
    {
        GlobalConstraintInterface.CallPhase when = GlobalConstraintInterface(_globalConstraint).when();
        if ((when == GlobalConstraintInterface.CallPhase.Pre)||
            (when == GlobalConstraintInterface.CallPhase.PreAndPost)) {
            if (!globalConstraintsRegisterPre[_globalConstraint].isRegistered) {
                globalConstraintsPre.push(_globalConstraint);
                globalConstraintsRegisterPre[_globalConstraint] =
                GlobalConstraintRegister(true, globalConstraintsPre.length-1);
            }
        }
        if ((when == GlobalConstraintInterface.CallPhase.Post)||
            (when == GlobalConstraintInterface.CallPhase.PreAndPost)) {
            if (!globalConstraintsRegisterPost[_globalConstraint].isRegistered) {
                globalConstraintsPost.push(_globalConstraint);
                globalConstraintsRegisterPost[_globalConstraint] =
                GlobalConstraintRegister(true, globalConstraintsPost.length-1);
            }
        }
        emit AddGlobalConstraint(_globalConstraint, when);
        return true;
    }

    /**
     * @dev remove Global Constraint
     * @param _globalConstraint the address of the global constraint to be remove.
     * @return bool which represents a success
     */
     // solhint-disable-next-line code-complexity
    function removeGlobalConstraint (address _globalConstraint)
    external
    onlyGlobalConstraintsScheme
    returns(bool)
    {
        GlobalConstraintRegister memory globalConstraintRegister;
        address globalConstraint;
        GlobalConstraintInterface.CallPhase when = GlobalConstraintInterface(_globalConstraint).when();
        bool retVal = false;

        if ((when == GlobalConstraintInterface.CallPhase.Pre)||
            (when == GlobalConstraintInterface.CallPhase.PreAndPost)) {
            globalConstraintRegister = globalConstraintsRegisterPre[_globalConstraint];
            if (globalConstraintRegister.isRegistered) {
                if (globalConstraintRegister.index < globalConstraintsPre.length-1) {
                    globalConstraint = globalConstraintsPre[globalConstraintsPre.length-1];
                    globalConstraintsPre[globalConstraintRegister.index] = globalConstraint;
                    globalConstraintsRegisterPre[globalConstraint].index = globalConstraintRegister.index;
                }
                globalConstraintsPre.length--;
                delete globalConstraintsRegisterPre[_globalConstraint];
                retVal = true;
            }
        }
        if ((when == GlobalConstraintInterface.CallPhase.Post)||
            (when == GlobalConstraintInterface.CallPhase.PreAndPost)) {
            globalConstraintRegister = globalConstraintsRegisterPost[_globalConstraint];
            if (globalConstraintRegister.isRegistered) {
                if (globalConstraintRegister.index < globalConstraintsPost.length-1) {
                    globalConstraint = globalConstraintsPost[globalConstraintsPost.length-1];
                    globalConstraintsPost[globalConstraintRegister.index] = globalConstraint;
                    globalConstraintsRegisterPost[globalConstraint].index = globalConstraintRegister.index;
                }
                globalConstraintsPost.length--;
                delete globalConstraintsRegisterPost[_globalConstraint];
                retVal = true;
            }
        }
        if (retVal) {
            emit RemoveGlobalConstraint(
            _globalConstraint,
            globalConstraintRegister.index,
            when == GlobalConstraintInterface.CallPhase.Pre
            );
        }
        return retVal;
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
        // make sure upgrade could be done once for a contract.
        require(newController == address(0), "this controller was already upgraded");
        require(_newController != address(0), "new controller cannot be 0");
        newController = _newController;
        avatar.transferOwnership(_newController);
        require(avatar.owner() == _newController, "failed to transfer avatar ownership to the new controller");
        if (nativeToken.owner() == address(this)) {
            nativeToken.transferOwnership(_newController);
            require(nativeToken.owner() == _newController, "failed to transfer token ownership to the new controller");
        }
        if (nativeReputation.owner() == address(this)) {
            nativeReputation.transferOwnership(_newController);
            require(nativeReputation.owner() == _newController,
            "failed to transfer reputation ownership to the new controller");
        }
        emit UpgradeController(address(this), newController);
        return true;
    }

    /**
    * @dev perform a generic call to an arbitrary contract
    * @param _contract  the contract's address to call
    * @param _data ABI-encoded contract call to call `_contract` address.
    * @param _value value (ETH) to transfer with the transaction
    * @return bool -success
    *         bytes  - the return value of the called _contract's function.
    */
    function genericCall(address _contract, bytes calldata _data, uint256 _value)
    external
    onlyGenericCallScheme
    onlySubjectToConstraint("genericCall")
    returns (bool, bytes memory)
    {
        return avatar.genericCall(_contract, _data, _value);
    }

  /**
   * @dev send some ether
   * @param _amountInWei the amount of ether (in Wei) to send
   * @param _to address of the beneficiary
   * @return bool which represents a success
   */
    function sendEther(uint256 _amountInWei, address payable _to)
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
    function externalTokenTransfer(IERC20 _externalToken, address _to, uint256 _value)
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
    function externalTokenTransferFrom(
    IERC20 _externalToken,
    address _from,
    address _to,
    uint256 _value)
    external
    onlyRegisteredScheme
    onlySubjectToConstraint("externalTokenTransferFrom")
    returns(bool)
    {
        return avatar.externalTokenTransferFrom(_externalToken, _from, _to, _value);
    }

    /**
    * @dev externalTokenApproval approve the spender address to spend a specified amount of tokens
    *      on behalf of msg.sender.
    * @param _externalToken the address of the Token Contract
    * @param _spender address
    * @param _value the amount of ether (in Wei) which the approval is referring to.
    * @return bool which represents a success
    */
    function externalTokenApproval(IERC20 _externalToken, address _spender, uint256 _value)
    external
    onlyRegisteredScheme
    onlySubjectToConstraint("externalTokenIncreaseApproval")
    returns(bool)
    {
        return avatar.externalTokenApproval(_externalToken, _spender, _value);
    }

    /**
    * @dev setDBValue set a key value in the dao db
    * @param _key a string
    * @param _value a string
    * @return bool success
    */
    function setDBValue(string calldata _key, string calldata _value)
    external
    onlyRegisteredScheme returns(bool) {
        return avatar.setDBValue(_key, _value);
    }

    /**
    * @dev metaData emits an event with a string, should contain the hash of some meta data.
    * @param _metaData a string representing a hash of the meta data
    * @return bool which represents a success
    */
    function metaData(string calldata _metaData)
        external
        onlyMetaDataScheme
        returns(bool)
        {
        return avatar.metaData(_metaData);
    }

    function isSchemeRegistered(address _scheme) external view returns(bool) {
        return _isSchemeRegistered(_scheme);
    }

   /**
    * @dev globalConstraintsCount return the global constraint pre and post count
    * @return uint256 globalConstraintsPre count.
    * @return uint256 globalConstraintsPost count.
    */
    function globalConstraintsCount()
        external
        view
        returns(uint, uint)
        {
        return (globalConstraintsPre.length, globalConstraintsPost.length);
    }

    function isGlobalConstraintRegistered(address _globalConstraint)
        external
        view
        returns(bool)
        {
        return (globalConstraintsRegisterPre[_globalConstraint].isRegistered ||
                globalConstraintsRegisterPost[_globalConstraint].isRegistered);
    }

    function _isSchemeRegistered(address _scheme) private view returns(bool) {
        return (schemesPermissions[_scheme]&bytes4(0x00000001) != bytes4(0));
    }
}
