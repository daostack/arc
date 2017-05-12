pragma solidity ^0.4.11;

import "../controller/Controller.sol";

contract UniversalGenesisScheme {
    Controller public controller;

    function UniversalGenesisScheme( ) {

    }

    function forgeOrg (string orgName,
                        string tokenName,
                        string tokenSymbol,
                        address[] _founders,
                        int[] _foundersTokenAmount,
                        int[] _foundersReputationAmount,
                        address _upgradinScheme) {

        controller = new Controller( orgName, tokenName, tokenSymbol, this, _upgradinScheme);
        for( uint i = 0 ; i < _founders.length ; i++ ) {
            if( ! controller.mintTokens( _foundersTokenAmount[i], _founders[i] ) ) revert();
            if( ! controller.mintReputation( _foundersReputationAmount[i], _founders[i] ) ) revert();
        }
    }
}
