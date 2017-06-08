pragma solidity ^0.4.11;

import "../controller/Controller.sol";

contract UniversalGenesisScheme {

    event NewOrg (address _controller);

    function UniversalGenesisScheme( ) {
    }

    function forgeOrg (string orgName,
                        string tokenName,
                        string tokenSymbol,
                        address[] _founders,
                        int[] _foundersTokenAmount,
                        int[] _foundersReputationAmount,
                        address _registeringScheme,
                        bytes32 _registeringSchemeParams,
                        address _upgradingScheme,
                        bytes32 _upgradingSchemeParams,
                        address _globalConstraintScheme,
                        bytes32 _globalConstraintsSchemeParams) returns(address) {

        Controller controller = new Controller( orgName, tokenName, tokenSymbol, this, bytes32(0),_upgradingScheme,
                                          _upgradingSchemeParams, _globalConstraintScheme, _globalConstraintsSchemeParams);

        // Mint token and reputation for founders:
        for( uint i = 0 ; i < _founders.length ; i++ ) {
            if( ! controller.mintTokens( _foundersTokenAmount[i], _founders[i] ) ) revert();
            if( ! controller.mintReputation( _foundersReputationAmount[i], _founders[i] ) ) revert();
        }

        // register the registering scheme and remove this scheme.
        controller.registerScheme( _registeringScheme, true, _registeringSchemeParams );
        controller.unregisterScheme( this );

        NewOrg (address(controller));
        return (address(controller));
    }
}
