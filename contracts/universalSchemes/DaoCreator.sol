pragma solidity ^0.4.24;

import "../controller/DAOToken.sol";
import "../controller/Reputation.sol";
import "./UniversalScheme.sol";
import "../controller/UController.sol";
import "../controller/Controller.sol";


/**
 * @title ControllerCreator for creating a single controller.
 */

contract ControllerCreator {

    function create(Avatar _avatar) public returns(address) {
        Controller controller = new Controller(_avatar);
        controller.registerScheme(msg.sender,bytes32(0),bytes4(0x1F),address(_avatar));
        controller.unregisterScheme(this,address(_avatar));
        return address(controller);
    }
}

/**
 * @title Genesis Scheme that creates organizations
 */


contract DaoCreator {

    mapping(address=>address) public locks;

    event NewOrg (address _avatar);
    event InitialSchemesSet (address _avatar);
    ControllerCreator controllerCreator;

    constructor(ControllerCreator _controllerCreator) public {
        controllerCreator = _controllerCreator;
    }

    /**
      * @dev addFounders add founders to the organization.
      *      this function can be called only after forgeOrg and before setSchemes
      * @param _avatar the organization avatar
      * @param _founders An array with the addresses of the founders of the organization
      * @param _foundersTokenAmount An array of amount of tokens that the founders
      *  receive in the new organization
      * @param _foundersReputationAmount An array of amount of reputation that the
      *   founders receive in the new organization
      * @return bool true or false
      */
    function addFounders (
        Avatar _avatar,
        address[] _founders,
        uint[] _foundersTokenAmount,
        uint[] _foundersReputationAmount
      )
      external
      returns(bool)
      {
        require(_founders.length == _foundersTokenAmount.length);
        require(_founders.length == _foundersReputationAmount.length);
        require(_founders.length > 0);
        require(locks[address(_avatar)] == msg.sender);
        // Mint token and reputation for founders:
        for (uint i = 0 ; i < _founders.length ; i++ ) {
            require(_founders[i] != address(0));
            if (_foundersTokenAmount[i] > 0) {
                ControllerInterface(_avatar.owner()).mintTokens(_foundersTokenAmount[i],_founders[i],address(_avatar));
            }
            if (_foundersReputationAmount[i] > 0) {
                ControllerInterface(_avatar.owner()).mintReputation(_foundersReputationAmount[i],_founders[i],address(_avatar));
            }
        }
        return true;

    }

  /**
    * @dev Create a new organization
    * @param _orgName The name of the new organization
    * @param _tokenName The name of the token associated with the organization
    * @param _tokenSymbol The symbol of the token
    * @param _founders An array with the addresses of the founders of the organization
    * @param _foundersTokenAmount An array of amount of tokens that the founders
    *  receive in the new organization
    * @param _foundersReputationAmount An array of amount of reputation that the
    *   founders receive in the new organization
    * @param  _uController universal controller instance
    *         if _uController address equal to zero the organization will use none universal controller.
    * @param  _cap token cap - 0 for no cap.
    * @return The address of the avatar of the controller
    */
    function forgeOrg (
        bytes32 _orgName,
        string _tokenName,
        string _tokenSymbol,
        address[] _founders,
        uint[] _foundersTokenAmount,
        uint[] _foundersReputationAmount,
        UController _uController,
        uint _cap
      )
      external
      returns(address)
      {
        //The call for the private function is needed to bypass a deep stack issues
        return _forgeOrg(
            _orgName,
            _tokenName,
            _tokenSymbol,
            _founders,
            _foundersTokenAmount,
            _foundersReputationAmount,
            _uController,
            _cap);
    }

     /**
      * @dev Set initial schemes for the organization.
      * @param _avatar organization avatar (returns from forgeOrg)
      * @param _schemes the schemes to register for the organization
      * @param _params the schemes's params
      * @param _permissions the schemes permissions.
      */
    function setSchemes (
        Avatar _avatar,
        address[] _schemes,
        bytes32[] _params,
        bytes4[] _permissions
    )
        external
    {
        // this action can only be executed by the account that holds the lock
        // for this controller
        require(locks[address(_avatar)] == msg.sender);
        // register initial schemes:
        ControllerInterface controller = ControllerInterface(_avatar.owner());
        for ( uint i = 0 ; i < _schemes.length ; i++ ) {
            controller.registerScheme(_schemes[i], _params[i], _permissions[i],address(_avatar));
        }
        // Unregister self:
        controller.unregisterScheme(this,address(_avatar));
        // Remove lock:
        delete locks[address(_avatar)];
        emit InitialSchemesSet(address(_avatar));
    }

    /**
     * @dev Create a new organization
     * @param _orgName The name of the new organization
     * @param _tokenName The name of the token associated with the organization
     * @param _tokenSymbol The symbol of the token
     * @param _founders An array with the addresses of the founders of the organization
     * @param _foundersTokenAmount An array of amount of tokens that the founders
     *  receive in the new organization
     * @param _foundersReputationAmount An array of amount of reputation that the
     *   founders receive in the new organization
     * @param  _uController universal controller instance
     *         if _uController address equal to zero the organization will use none universal controller.
     * @param  _cap token cap - 0 for no cap.
     * @return The address of the avatar of the controller
     */
    function _forgeOrg (
        bytes32 _orgName,
        string _tokenName,
        string _tokenSymbol,
        address[] _founders,
        uint[] _foundersTokenAmount,
        uint[] _foundersReputationAmount,
        UController _uController,
        uint _cap
    ) private returns(address)
    {
        // Create Token, Reputation and Avatar:
        require(_founders.length == _foundersTokenAmount.length);
        require(_founders.length == _foundersReputationAmount.length);
        require(_founders.length > 0);
        DAOToken  nativeToken = new DAOToken(_tokenName, _tokenSymbol,_cap);
        Reputation  nativeReputation = new Reputation();
        Avatar  avatar = new Avatar(_orgName, nativeToken, nativeReputation);
        ControllerInterface  controller;

        // Mint token and reputation for founders:
        for (uint i = 0 ; i < _founders.length ; i++ ) {
            require(_founders[i] != address(0));
            if (_foundersTokenAmount[i] > 0) {
                nativeToken.mint(_founders[i],_foundersTokenAmount[i]);
            }
            if (_foundersReputationAmount[i] > 0) {
                nativeReputation.mint(_founders[i],_foundersReputationAmount[i]);
            }
        }

        // Create Controller:
        if (UController(0) == _uController) {
            controller = ControllerInterface(controllerCreator.create(avatar));
            avatar.transferOwnership(controller);
        } else {
            controller = _uController;
            avatar.transferOwnership(controller);
            _uController.newOrganization(avatar);
        }
        // Transfer ownership:
        nativeToken.transferOwnership(controller);
        nativeReputation.transferOwnership(controller);

        locks[address(avatar)] = msg.sender;

        emit NewOrg (address(avatar));
        return (address(avatar));
    }
}
