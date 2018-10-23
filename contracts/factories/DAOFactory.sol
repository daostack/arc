pragma solidity ^0.4.24;

import "../universalSchemes/UniversalScheme.sol";
import "../controller/Controller.sol";
import "./ActorsFactory.sol";
import "./ControllerFactory.sol";


/**
 * @title DAO factory that creates new DAOs
 */
contract DAOFactory {

    mapping(address => address) public locks;

    event NewOrg(address _avatar);
    event InitialSchemesSet(address _avatar);

    ControllerFactory controllerFactory;
    ActorsFactory actorsFactory;

    constructor(ControllerFactory _controllerFactory, ActorsFactory _actorsFactory) public {
        controllerFactory = _controllerFactory;
        actorsFactory = _actorsFactory;
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
                ControllerInterface(_avatar.owner()).mintTokens(_foundersTokenAmount[i],_founders[i]);
            }
            if (_foundersReputationAmount[i] > 0) {
                ControllerInterface(_avatar.owner()).mintReputation(_foundersReputationAmount[i],_founders[i]);
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
    * @param  _cap token cap - 0 for no cap.
    * @return The address of the avatar of the controller
    */
    function forgeOrg (
        string _orgName,
        string _tokenName,
        string _tokenSymbol,
        address[] _founders,
        uint[] _foundersTokenAmount,
        uint[] _foundersReputationAmount,
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
            controller.registerScheme(_schemes[i], _params[i], _permissions[i]);
        }
        // Unregister self:
        controller.unregisterScheme(this);
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
     * @param  _cap token cap - 0 for no cap.
     * @return The address of the avatar of the controller
     */
    function _forgeOrg (
        string _orgName,
        string _tokenName,
        string _tokenSymbol,
        address[] _founders,
        uint[] _foundersTokenAmount,
        uint[] _foundersReputationAmount,
        uint _cap
    ) private returns(address)
    {
        // Create Token, Reputation and Avatar:
        require(_founders.length == _foundersTokenAmount.length);
        require(_founders.length == _foundersReputationAmount.length);
        require(_founders.length > 0);
        
        Reputation nativeReputation = new Reputation();
        DAOToken nativeToken = DAOToken(actorsFactory.createDAOToken(_tokenName, _tokenSymbol, _cap));
        Avatar avatar = Avatar(actorsFactory.createAvatar(_orgName, nativeToken, nativeReputation));
        ControllerInterface controller;

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
        
        controller = ControllerInterface(controllerFactory.createController(avatar));
        avatar.transferOwnership(controller);
        

        // Transfer ownership:
        nativeToken.transferOwnership(controller);
        nativeReputation.transferOwnership(controller);

        locks[address(avatar)] = msg.sender;

        emit NewOrg(address(avatar));
        return address(avatar);
    }
}
