pragma solidity ^0.4.11;

import "../controller/Avatar.sol";
import "../controller/Reputation.sol";
import "../controller/MintableToken.sol";
import "../controller/Controller.sol";

/**
 * @title Universal Genesis Scheme
 * @dev A contract to create Organizations
 */

contract UniversalGenesisScheme {
    MintableToken nativeToken;
    Reputation nativeReputation;
    Avatar avatar;

    mapping(address=>address) locks;

    event NewOrg (address _controller);

    function UniversalGenesisScheme( ) {
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
     *
     * @return The address of the Controller
     */

    function forgeOrg (
        bytes32 _orgName,
        string _tokenName,
        string _tokenSymbol,
        address[] _founders,
        uint[] _foundersTokenAmount,
        int[] _foundersReputationAmount
    ) returns(address) {

        // Create Token, Reputation and Avatar:
        nativeToken = new MintableToken(_tokenName, _tokenSymbol);
        nativeReputation = new Reputation();
        avatar =  new Avatar(_orgName, nativeToken, nativeReputation);

        // Create Controller:
        Controller controller = new Controller(avatar, nativeToken, nativeReputation, this, bytes32(0),
                                                  this, bytes32(0), this, bytes32(0));

        // Transfer ownership:
        avatar.transferOwnership(controller);
        nativeToken.transferOwnership(controller);
        nativeReputation.transferOwnership(controller);

        // Mint token and reputation for founders:
        for( uint i = 0 ; i < _founders.length ; i++ ) {
            if( ! controller.mintTokens( _foundersTokenAmount[i], _founders[i] ) ) revert();
            if( ! controller.mintReputation( _foundersReputationAmount[i], _founders[i] ) ) revert();
        }

        locks[controller] = msg.sender;

        NewOrg (address(controller));
        return (address(controller));
    }

    /**
     * @dev  register some initial schemes
     */

    function setInitialSchemes (
        Controller _controller,
        address _registeringScheme,
        address _upgradingScheme,
        address _globalConstraintsScheme,
        bytes32 _registeringSchemeParams,
        bytes32 _upgradingSchemeParams,
        bytes32 _globalConstraintsSchemeParams
    ) {
        require(locks[address(_controller)] == msg.sender);


        // register the registering scheme and remove this scheme.
        _controller.registerScheme(_registeringScheme, true, _registeringSchemeParams);
        _controller.changeUpgradeScheme(_upgradingScheme, _upgradingSchemeParams);
        _controller.changeGlobalConstraintsScheme(_globalConstraintsScheme, _globalConstraintsSchemeParams);
        _controller.unregisterScheme(this);

        // Remove lock:
        delete locks[_controller];
        return;
    }
}
