pragma solidity ^0.4.11;

import "../controller/Avatar.sol";
import "../controller/Reputation.sol";
import "../controller/MintableToken.sol";
import "../controller/Controller.sol";

contract UniversalGenesisScheme {
    MintableToken nativeToken;
    Reputation nativeReputation;
    Avatar avatar;

    mapping(address=>address) owners;

    event NewOrg (address _controller);

    function UniversalGenesisScheme( ) {
    }

    function forgeOrg (bytes32 _orgName,
                        string _tokenName,
                        string _tokenSymbol,
                        address[] _founders,
                        uint[] _foundersTokenAmount,
                        int[] _foundersReputationAmount) returns(address) {

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

        owners[msg.sender] = controller;

        NewOrg (address(controller));
        return (address(controller));
    }

    function listInitialSchemes (Controller _controller,
                                  address _registeringScheme,
                                  address _upgradingScheme,
                                  address _globalConstraintsScheme,
                                  bytes32 _registeringSchemeParams,
                                  bytes32 _upgradingSchemeParams,
                                  bytes32 _globalConstraintsSchemeParams) {
        require(owners[msg.sender] == address(_controller));

        // Remove record:
        delete owners[_controller];

        // register the registering scheme and remove this scheme.
        _controller.registerScheme( _registeringScheme, true, _registeringSchemeParams );
        _controller.changeUpgradeScheme(_upgradingScheme, _upgradingSchemeParams);
        _controller.changeGlobalConstraintsScheme(_globalConstraintsScheme, _globalConstraintsSchemeParams);
        _controller.unregisterScheme( this );
    }
}
