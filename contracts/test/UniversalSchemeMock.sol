pragma solidity ^0.4.18;

import "../universalSchemes/UniversalScheme.sol";


contract UniversalSchemeMock is UniversalScheme {

    function UniversalSchemeMock(StandardToken _nativeToken, uint _fee, address _beneficiary) public {
        updateParameters(_nativeToken, _fee, _beneficiary, bytes32(0));
    }
}
