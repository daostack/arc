pragma solidity ^0.5.11;

import "../schemes/CurveInterface.sol";

/**
 * @title A Curve contract which implement the function of square root.
 * the result is normalized for the total reputation allocated. 
*/

contract PolkaCurve is CurveInterface {

    uint256 public constant TOTAL_REPUTATION = 800000;
    uint256 public constant SUM_OF_SQRTS = 1718050;

    function calc(uint256 _value) external pure returns (uint256 sqrt) {
        uint value = _value * 1 ether;
        uint z = (value + 1) / 2;
        sqrt = value;
        while (z < sqrt) {
            sqrt = z;
            z = (value / z + z) / 2;
        }
        sqrt = ((sqrt*TOTAL_REPUTATION)/SUM_OF_SQRTS) * 1000000000;
    }
}
