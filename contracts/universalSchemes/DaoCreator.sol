pragma solidity ^0.4.19;

import "../controller/DAOToken.sol";
import "../controller/Reputation.sol";
import "./UniversalScheme.sol";
import "../controller/UController.sol";
import "../controller/Controller.sol";


/**
 * @title Genesis Scheme that creates organizations
 */

contract DaoCreator {

    mapping(address=>address) locks;

    event NewOrg (address _avatar);
    event InitialSchemesSet (address _avatar);
    function DaoCreator() public {}
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
    * @return The address of the avatar of the controller
    */
    function forgeOrg (
        bytes32 _orgName,
        string _tokenName,
        string _tokenSymbol,
        address[] _founders,
        uint[] _foundersTokenAmount,
        int[] _foundersReputationAmount,
        UController _uController
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
            _uController);
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
        delete locks[_avatar];

        InitialSchemesSet(address(_avatar));
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
     * @return The address of the avatar of the controller
     */
    function _forgeOrg (
        bytes32 _orgName,
        string _tokenName,
        string _tokenSymbol,
        address[] _founders,
        uint[] _foundersTokenAmount,
        int[] _foundersReputationAmount,
        UController _uController
    ) private returns(address)
    {
        // Create Token, Reputation and Avatar:
        DAOToken  nativeToken = new DAOToken(_tokenName, _tokenSymbol);
        Reputation  nativeReputation = new Reputation();
        Avatar  avatar = new Avatar(_orgName, nativeToken, nativeReputation);
        ControllerInterface  controller;

        // Mint token and reputation for founders:
        for (uint i = 0 ; i < _founders.length ; i++ ) {
            nativeToken.mint(_founders[i],_foundersTokenAmount[i]);
            nativeReputation.mint(_founders[i],_foundersReputationAmount[i]);
        }

        // Create Controller:
        if (UController(0) == _uController) {
            controller = new Controller(avatar);
            avatar.transferOwnership(controller);
        } else {
            controller = _uController;
            avatar.transferOwnership(controller);
            _uController.newOrganization(avatar);
        }
        // Transfer ownership:
        nativeToken.transferOwnership(controller);
        nativeReputation.transferOwnership(controller);

        locks[avatar] = msg.sender;

        NewOrg (address(avatar));
        return (address(avatar));
    }
}
