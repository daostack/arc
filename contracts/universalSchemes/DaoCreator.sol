pragma solidity ^0.4.19;

import "../controller/DAOToken.sol";
import "../controller/Reputation.sol";
import "./UniversalScheme.sol";
import "../controller/UController.sol";
import "../controller/Controller.sol";


contract DaoOrgansCreator {
    event NewDaoOrgans (address _nativeToken,address _nativeReputation);

    function createDaoOrgans (
        string _tokenName,
        string _tokenSymbol,
        address[] _founders,
        uint[] _foundersTokenAmount,
        int[] _foundersReputationAmount
    )
    external
    returns(address,address)
    {
        return _createDaoOrgans(
            _tokenName,
            _tokenSymbol,
            _founders,
            _foundersTokenAmount,
            _foundersReputationAmount
        );
    }

    function transferOwnership (
        DAOToken  _nativeToken,
        Reputation _nativeReputation)
        public
        {
          // Transfer ownership:
        _nativeToken.transferOwnership(msg.sender);
        _nativeReputation.transferOwnership(msg.sender);
    }

    function _createDaoOrgans (
        string _tokenName,
        string _tokenSymbol,
        address[] _founders,
        uint[] _foundersTokenAmount,
        int[] _foundersReputationAmount
    )
    private
    returns(address,address)
    {
      // Create Token, Reputation and Avatar:
        require(_founders.length == _foundersTokenAmount.length);
        require(_founders.length == _foundersReputationAmount.length);
        DAOToken  nativeToken = new DAOToken(_tokenName, _tokenSymbol);
        Reputation  nativeReputation = new Reputation();

        // Mint token and reputation for founders:
        for (uint i = 0 ; i < _founders.length ; i++ ) {
            require(_founders[i] != address(0));
            nativeToken.mint(_founders[i],_foundersTokenAmount[i]);
            nativeReputation.mint(_founders[i],_foundersReputationAmount[i]);
        }
        NewDaoOrgans(address(nativeToken),address(nativeReputation));
        return (address(nativeToken),address(nativeReputation));
    }
}


/**
 * @title Genesis Scheme that creates organizations
 */

contract DaoCreator {

    mapping(address=>address) public locks;

    event NewOrg (address _avatar);
    event InitialSchemesSet (address _avatar);
    function DaoCreator() public {}
  /**
    * @dev Create a new organization
    * @param  _orgName organization's name
    * @param  _nativeToken organization's token contract
    * @param  _nativeReputation  organization's reputation contract
    * @param  _uController universal controller instance
    *         if _uController address equal to zero the organization will use none universal controller.
    * @return The address of the avatar of the controller
    */
    function forgeOrg (
        DaoOrgansCreator daoOrgansCreator,
        bytes32 _orgName,
        DAOToken _nativeToken,
        Reputation _nativeReputation,
        UController _uController
      )
      external
      returns(address)
      {
        ControllerInterface  controller;
        Avatar  avatar = new Avatar(_orgName, _nativeToken, _nativeReputation);
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
        daoOrgansCreator.transferOwnership(_nativeToken,_nativeReputation);
        _nativeToken.transferOwnership(controller);
        _nativeReputation.transferOwnership(controller);

        locks[address(avatar)] = msg.sender;

        NewOrg (address(avatar));
        return (address(avatar));
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

        InitialSchemesSet(address(_avatar));
    }
}
