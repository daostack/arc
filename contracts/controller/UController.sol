pragma solidity ^0.4.19;

import "./Avatar.sol";
import "./Reputation.sol";
import "./DAOToken.sol";
import "../globalConstraints/GlobalConstraintInterface.sol";
import "./ControllerInterface.sol";


/**
 * @title Universal Controller contract
 * @dev A universal controller hold organizations and controls their tokens ,reputations
 *       and avatar.
 * It is subject to a set of schemes and constraints that determine its behavior.
 * Each scheme has it own parameters and operation permissions.
 */
contract UController is ControllerInterface {

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

    struct GlobalConstraintRegister {
        bool register; //is register
        uint index;    //index at globalConstraints
    }

    struct Organization {
        DAOToken                  nativeToken;
        Reputation                nativeReputation;
        mapping(address=>Scheme)  schemes;
      // globalConstraintsPre that determine pre- conditions for all actions on the controller
        GlobalConstraint[] globalConstraintsPre;
        // globalConstraintsPost that determine post-conditions for all actions on the controller
        GlobalConstraint[] globalConstraintsPost;
      // globalConstraintsRegisterPre indicate if a globalConstraints is registered as a Pre global constraint.
        mapping(address=>GlobalConstraintRegister) globalConstraintsRegisterPre;
      // globalConstraintsRegisterPost indicate if a globalConstraints is registered as a Post global constraint.
        mapping(address=>GlobalConstraintRegister) globalConstraintsRegisterPost;
        bool exist;
    }

    //mapping between organization's avatar address to Organization
    mapping(address=>Organization) public organizations;
  // newController will point to the new controller after the present controller is upgraded
  //  address public newController;
    mapping(address=>address) public newControllers;//mapping between avatar address and newController address

    event MintReputation (address indexed _sender, address indexed _beneficiary, int256 _amount,address indexed _avatar);
    event MintTokens (address indexed _sender, address indexed _beneficiary, uint256 _amount, address indexed _avatar);
    event RegisterScheme (address indexed _sender, address indexed _scheme,address indexed _avatar);
    event UnregisterScheme (address indexed _sender, address indexed _scheme, address indexed _avatar);
    event GenericAction (address indexed _sender, bytes32[] _params);
    event SendEther (address indexed _sender, uint _amountInWei, address indexed _to);
    event ExternalTokenTransfer (address indexed _sender, address indexed _externalToken, address indexed _to, uint _value);
    event ExternalTokenTransferFrom (address indexed _sender, address indexed _externalToken, address _from, address _to, uint _value);
    event ExternalTokenIncreaseApproval (address indexed _sender, StandardToken indexed _externalToken, address _spender, uint _value);
    event ExternalTokenDecreaseApproval (address indexed _sender, StandardToken indexed _externalToken, address _spender, uint _value);
    event UpgradeController(address _oldController,address _newController,address _avatar);
    event AddGlobalConstraint(address _globalConstraint, bytes32 _params,GlobalConstraintInterface.CallPhase _when,address indexed _avatar);
    event RemoveGlobalConstraint(address _globalConstraint ,uint256 _index,bool _isPre,address indexed _avatar);

    function UController()public {}

   /**
    * @dev newOrganization set up a new organization with default daoCreator.
    * @param _avatar the organization avatar
    */
    function newOrganization(
        Avatar _avatar
    ) public
    {
        require(!organizations[address(_avatar)].exist);
        require(_avatar.owner() == address(this));
        organizations[address(_avatar)].exist = true;
        organizations[address(_avatar)].nativeToken = _avatar.nativeToken();
        organizations[address(_avatar)].nativeReputation = _avatar.nativeReputation();
        organizations[address(_avatar)].schemes[msg.sender] = Scheme({paramsHash: bytes32(0),permissions: bytes4(0xF)});
        RegisterScheme(msg.sender, msg.sender,_avatar);
    }

  // Modifiers:
    modifier onlyRegisteredScheme(address avatar) {
        require(organizations[avatar].schemes[msg.sender].permissions&bytes4(1) == bytes4(1));
        _;
    }

    modifier onlyRegisteringSchemes(address avatar) {
        require(organizations[avatar].schemes[msg.sender].permissions&bytes4(2) == bytes4(2));
        _;
    }

    modifier onlyGlobalConstraintsScheme(address avatar) {
        require(organizations[avatar].schemes[msg.sender].permissions&bytes4(4) == bytes4(4));
        _;
    }

    modifier onlyUpgradingScheme(address _avatar) {
        require(organizations[_avatar].schemes[msg.sender].permissions&bytes4(8) == bytes4(8));
        _;
    }

    modifier onlySubjectToConstraint(bytes32 func,address _avatar) {
        uint index;
        GlobalConstraint[] memory globalConstraintsPre = organizations[_avatar].globalConstraintsPre;
        GlobalConstraint[] memory globalConstraintsPost = organizations[_avatar].globalConstraintsPost;
        for (index = 0;index<globalConstraintsPre.length;index++) {
            require((GlobalConstraintInterface(globalConstraintsPre[index].gcAddress)).pre(msg.sender, globalConstraintsPre[index].params, func));
        }
        _;
        for (index = 0;index<globalConstraintsPost.length;index++) {
            require((GlobalConstraintInterface(globalConstraintsPost[index].gcAddress)).post(msg.sender, globalConstraintsPost[index].params, func));
        }
    }

    /**
     * @dev mint reputation .
     * @param  _amount amount of reputation to mint
     * @param _beneficiary beneficiary address
     * @param _avatar the organization avatar.
     * @return bool which represents a success
     */
    function mintReputation(int256 _amount, address _beneficiary, address _avatar)
    public
    onlyRegisteredScheme(_avatar)
    onlySubjectToConstraint("mintReputation",_avatar)
    returns(bool)
    {
        MintReputation(msg.sender, _beneficiary, _amount,_avatar);
        return organizations[_avatar].nativeReputation.mint(_beneficiary, _amount);
    }

    /**
     * @dev mint tokens .
     * @param  _amount amount of token to mint
     * @param _beneficiary beneficiary address
     * @param _avatar the organization avatar.
     * @return bool which represents a success
     */
    function mintTokens(uint256 _amount, address _beneficiary,address _avatar)
    public
    onlyRegisteredScheme(_avatar)
    onlySubjectToConstraint("mintTokens",_avatar)
    returns(bool)
    {
        MintTokens(msg.sender, _beneficiary, _amount,_avatar);
        return organizations[_avatar].nativeToken.mint(_beneficiary, _amount);
    }

  /**
   * @dev register or update a scheme
   * @param _scheme the address of the scheme
   * @param _paramsHash a hashed configuration of the usage of the scheme
   * @param _permissions the permissions the new scheme will have
   * @param _avatar the organization avatar.
   * @return bool which represents a success
   */
    function registerScheme(address _scheme, bytes32 _paramsHash, bytes4 _permissions,address _avatar)
    public
    onlyRegisteringSchemes(_avatar)
    onlySubjectToConstraint("registerScheme",_avatar)
    returns(bool)
    {
        bytes4 schemePermission = organizations[_avatar].schemes[_scheme].permissions;
        bytes4 senderPermission = organizations[_avatar].schemes[msg.sender].permissions;
    // Check scheme has at least the permissions it is changing, and at least the current permissions:
    // Implementation is a bit messy. One must recall logic-circuits ^^

    // produces non-zero if sender does not have all of the perms that are changing between old and new
        require(bytes4(15)&(_permissions^schemePermission)&(~senderPermission) == bytes4(0));

    // produces non-zero if sender does not have all of the perms in the old scheme
        require(bytes4(15)&(schemePermission&(~senderPermission)) == bytes4(0));

    // Add or change the scheme:
        organizations[_avatar].schemes[_scheme] = Scheme({paramsHash:_paramsHash,permissions:_permissions|bytes4(1)});
        RegisterScheme(msg.sender, _scheme, _avatar);
        return true;
    }

    /**
     * @dev unregister a scheme
     * @param _scheme the address of the scheme
     * @param _avatar the organization avatar.
     * @return bool which represents a success
     */
    function unregisterScheme(address _scheme,address _avatar)
    public
    onlyRegisteringSchemes(_avatar)
    onlySubjectToConstraint("unregisterScheme",_avatar)
    returns(bool)
    {
        bytes4 schemePermission = organizations[_avatar].schemes[_scheme].permissions;
    //check if the scheme is register
        if (schemePermission&bytes4(1) == bytes4(0)) {
            return false;
          }
    // Check the unregistering scheme has enough permissions:
        require(bytes4(15)&(schemePermission&(~organizations[_avatar].schemes[msg.sender].permissions)) == bytes4(0));

    // Unregister:
        UnregisterScheme(msg.sender, _scheme,_avatar);
        delete organizations[_avatar].schemes[_scheme];
        return true;
    }

    /**
     * @dev unregister the caller's scheme
     * @param _avatar the organization avatar.
     * @return bool which represents a success
     */
    function unregisterSelf(address _avatar) public returns(bool) {
        if (isSchemeRegistered(msg.sender,_avatar) == false) {
            return false;
        }
        delete organizations[_avatar].schemes[msg.sender];
        UnregisterScheme(msg.sender, msg.sender,_avatar);
        return true;
    }

    function isSchemeRegistered( address _scheme,address _avatar) public view returns(bool) {
        return (organizations[_avatar].schemes[_scheme].permissions&bytes4(1) != bytes4(0));
    }

    function getSchemeParameters(address _scheme,address _avatar) public view returns(bytes32) {
        return organizations[_avatar].schemes[_scheme].paramsHash;
    }

    function getSchemePermissions(address _scheme,address _avatar) public view returns(bytes4) {
        return organizations[_avatar].schemes[_scheme].permissions;
    }

   /**
   * @dev globalConstraintsCount return the global constraint pre and post count
   * @return uint globalConstraintsPre count.
   * @return uint globalConstraintsPost count.
   */
    function globalConstraintsCount(address _avatar) public view returns(uint,uint) {
        return (organizations[_avatar].globalConstraintsPre.length,organizations[_avatar].globalConstraintsPost.length);
    }

    function isGlobalConstraintRegistered(address _globalConstraint,address _avatar) public view returns(bool) {
        return (organizations[_avatar].globalConstraintsRegisterPre[_globalConstraint].register ||
        organizations[_avatar].globalConstraintsRegisterPost[_globalConstraint].register) ;
    }

    /**
     * @dev add or update Global Constraint
     * @param _globalConstraint the address of the global constraint to be added.
     * @param _params the constraint parameters hash.
     * @param _avatar the avatar of the organization
     * @return bool which represents a success
     */
    function addGlobalConstraint(address _globalConstraint, bytes32 _params, address _avatar)
    public onlyGlobalConstraintsScheme(_avatar) returns(bool)
    {
        Organization storage organization = organizations[_avatar];
        GlobalConstraintInterface.CallPhase when = GlobalConstraintInterface(_globalConstraint).when();
        if ((when == GlobalConstraintInterface.CallPhase.Pre)||(when == GlobalConstraintInterface.CallPhase.PreAndPost)) {
            if (!organization.globalConstraintsRegisterPre[_globalConstraint].register) {
                organization.globalConstraintsPre.push(GlobalConstraint(_globalConstraint,_params));
                organization.globalConstraintsRegisterPre[_globalConstraint] = GlobalConstraintRegister(true,organization.globalConstraintsPre.length-1);
            }else {
                organization.globalConstraintsPre[organization.globalConstraintsRegisterPre[_globalConstraint].index].params = _params;
            }
        }

        if ((when == GlobalConstraintInterface.CallPhase.Post)||(when == GlobalConstraintInterface.CallPhase.PreAndPost)) {
            if (!organization.globalConstraintsRegisterPost[_globalConstraint].register) {
                organization.globalConstraintsPost.push(GlobalConstraint(_globalConstraint,_params));
                organization.globalConstraintsRegisterPost[_globalConstraint] = GlobalConstraintRegister(true,organization.globalConstraintsPost.length-1);
           }else {
                organization.globalConstraintsPost[organization.globalConstraintsRegisterPost[_globalConstraint].index].params = _params;
           }
        }
        AddGlobalConstraint(_globalConstraint, _params,when,_avatar);
        return true;
    }

    /**
     * @dev remove Global Constraint
     * @param _globalConstraint the address of the global constraint to be remove.
     * @param _avatar the organization avatar.
     * @return bool which represents a success
     */
    function removeGlobalConstraint (address _globalConstraint,address _avatar)
    public onlyGlobalConstraintsScheme(_avatar) returns(bool)
    {
        GlobalConstraintInterface.CallPhase when = GlobalConstraintInterface(_globalConstraint).when();
        if ((when == GlobalConstraintInterface.CallPhase.Pre)||(when == GlobalConstraintInterface.CallPhase.PreAndPost)) {
            removeGlobalConstraintPre(_globalConstraint,_avatar);
        }
        if ((when == GlobalConstraintInterface.CallPhase.Post)||(when == GlobalConstraintInterface.CallPhase.PreAndPost)) {
            removeGlobalConstraintPost(_globalConstraint,_avatar);
        }
        return false;
    }

  /**
    * @dev upgrade the Controller
    *      The function will trigger an event 'UpgradeController'.
    * @param  _newController the address of the new controller.
    * @param _avatar the organization avatar.
    * @return bool which represents a success
    */
    function upgradeController(address _newController,address _avatar)
    public onlyUpgradingScheme(_avatar) returns(bool)
    {
        require(newControllers[_avatar] == address(0));   // so the upgrade could be done once for a contract.
        require(_newController != address(0));
        newControllers[_avatar] = _newController;
        (Avatar(_avatar)).transferOwnership(_newController);
        if (organizations[_avatar].nativeToken.owner() == address(this)) {
            organizations[_avatar].nativeToken.transferOwnership(_newController);
        }
        if (organizations[_avatar].nativeReputation.owner() == address(this)) {
            organizations[_avatar].nativeReputation.transferOwnership(_newController);
        }
        UpgradeController(this,_newController,_avatar);
        return true;
    }

    /**
    * @dev do a generic delegate call to the contract which called us.
    * This function use delegatecall and might expose the organization to security
    * risk. Use this function only if you really knows what you are doing.
    * @param _params the params for the call.
    * @param _avatar the organization avatar.
    * @return bool which represents success
    */
    function genericAction(bytes32[] _params,address _avatar)
    public
    onlyRegisteredScheme(_avatar)
    onlySubjectToConstraint("genericAction",_avatar)
    returns(bool)
    {
        GenericAction(msg.sender, _params);
        return (Avatar(_avatar)).genericAction(msg.sender, _params);
    }

  /**
   * @dev send some ether
   * @param _amountInWei the amount of ether (in Wei) to send
   * @param _to address of the beneficiary
   * @param _avatar the organization avatar.
   * @return bool which represents a success
   */
    function sendEther(uint _amountInWei, address _to,address _avatar)
    public
    onlyRegisteredScheme(_avatar)
    onlySubjectToConstraint("sendEther",_avatar)
    returns(bool)
    {
        SendEther(msg.sender, _amountInWei, _to);
        return (Avatar(_avatar)).sendEther(_amountInWei, _to);
    }

    /**
    * @dev send some amount of arbitrary ERC20 Tokens
    * @param _externalToken the address of the Token Contract
    * @param _to address of the beneficiary
    * @param _value the amount of ether (in Wei) to send
    * @param _avatar the organization avatar.
    * @return bool which represents a success
    */
    function externalTokenTransfer(StandardToken _externalToken, address _to, uint _value,address _avatar)
    public
    onlyRegisteredScheme(_avatar)
    onlySubjectToConstraint("externalTokenTransfer",_avatar)
    returns(bool)
    {
        ExternalTokenTransfer(msg.sender, _externalToken, _to, _value);
        return (Avatar(_avatar)).externalTokenTransfer(_externalToken, _to, _value);
    }

    /**
    * @dev transfer token "from" address "to" address
    *      One must to approve the amount of tokens which can be spend from the
    *      "from" account.This can be done using externalTokenApprove.
    * @param _externalToken the address of the Token Contract
    * @param _from address of the account to send from
    * @param _to address of the beneficiary
    * @param _value the amount of ether (in Wei) to send
    * @param _avatar the organization avatar.
    * @return bool which represents a success
    */
    function externalTokenTransferFrom(StandardToken _externalToken, address _from, address _to, uint _value,address _avatar)
    public
    onlyRegisteredScheme(_avatar)
    onlySubjectToConstraint("externalTokenTransferFrom",_avatar)
    returns(bool)
    {
        ExternalTokenTransferFrom(msg.sender, _externalToken, _from, _to, _value);
        return (Avatar(_avatar)).externalTokenTransferFrom(_externalToken, _from, _to, _value);
    }

    /**
    * @dev increase approval for the spender address to spend a specified amount of tokens
    *      on behalf of msg.sender.
    * @param _externalToken the address of the Token Contract
    * @param _spender address
    * @param _addedValue the amount of ether (in Wei) which the approval is referring to.
    * @param _avatar the organization avatar.
    * @return bool which represents a success
    */
    function externalTokenIncreaseApproval(StandardToken _externalToken, address _spender, uint _addedValue,address _avatar)
    public
    onlyRegisteredScheme(_avatar)
    onlySubjectToConstraint("externalTokenIncreaseApproval",_avatar)
    returns(bool)
    {
        ExternalTokenIncreaseApproval(msg.sender,_externalToken,_spender,_addedValue);
        return (Avatar(_avatar)).externalTokenIncreaseApproval(_externalToken, _spender, _addedValue);
    }

    /**
    * @dev decrease approval for the spender address to spend a specified amount of tokens
    *      on behalf of msg.sender.
    * @param _externalToken the address of the Token Contract
    * @param _spender address
    * @param _subtractedValue the amount of ether (in Wei) which the approval is referring to.
    * @param _avatar the organization avatar.
    * @return bool which represents a success
    */
    function externalTokenDecreaseApproval(StandardToken _externalToken, address _spender, uint _subtractedValue,address _avatar)
    public
    onlyRegisteredScheme(_avatar)
    onlySubjectToConstraint("externalTokenDecreaseApproval",_avatar)
    returns(bool)
    {
        ExternalTokenDecreaseApproval(msg.sender,_externalToken,_spender,_subtractedValue);
        return (Avatar(_avatar)).externalTokenDecreaseApproval(_externalToken, _spender, _subtractedValue);
    }

    /**
     * @dev removeGlobalConstraintPre
     * @param _globalConstraint the address of the global constraint to be remove.
     * @param _avatar the organization avatar.
     * @return bool which represents a success
     */
    function removeGlobalConstraintPre(address _globalConstraint,address _avatar)
    private returns(bool)
    {
        GlobalConstraintRegister memory globalConstraintRegister = organizations[_avatar].globalConstraintsRegisterPre[_globalConstraint];
        GlobalConstraint[] storage globalConstraints = organizations[_avatar].globalConstraintsPre;

        if (globalConstraintRegister.register) {
            if (globalConstraintRegister.index < globalConstraints.length-1) {
                GlobalConstraint memory globalConstraint = globalConstraints[globalConstraints.length-1];
                globalConstraints[globalConstraintRegister.index] = globalConstraint;
                organizations[_avatar].globalConstraintsRegisterPre[globalConstraint.gcAddress].index = globalConstraintRegister.index;
              }
            globalConstraints.length--;
            delete organizations[_avatar].globalConstraintsRegisterPre[_globalConstraint];
            RemoveGlobalConstraint(_globalConstraint,globalConstraintRegister.index,true,_avatar);
            return true;
        }
        return false;
    }

    /**
     * @dev removeGlobalConstraintPost
     * @param _globalConstraint the address of the global constraint to be remove.
     * @param _avatar the organization avatar.
     * @return bool which represents a success
     */
    function removeGlobalConstraintPost(address _globalConstraint,address _avatar)
    private returns(bool)
    {
        GlobalConstraintRegister memory globalConstraintRegister = organizations[_avatar].globalConstraintsRegisterPost[_globalConstraint];
        GlobalConstraint[] storage globalConstraints = organizations[_avatar].globalConstraintsPost;

        if (globalConstraintRegister.register) {
            if (globalConstraintRegister.index < globalConstraints.length-1) {
                GlobalConstraint memory globalConstraint = globalConstraints[globalConstraints.length-1];
                globalConstraints[globalConstraintRegister.index] = globalConstraint;
                organizations[_avatar].globalConstraintsRegisterPost[globalConstraint.gcAddress].index = globalConstraintRegister.index;
              }
            globalConstraints.length--;
            delete organizations[_avatar].globalConstraintsRegisterPost[_globalConstraint];
            RemoveGlobalConstraint(_globalConstraint,globalConstraintRegister.index,false,_avatar);
            return true;
        }
        return false;
    }
}
