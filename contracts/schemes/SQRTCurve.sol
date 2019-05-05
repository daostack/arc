pragma solidity ^0.5.4;

import "./CurveInterface.sol";

/**
 * @title A Curve contract which implement the function of square root
*/

contract SQRTCurve is CurveInterface {

    function calc(uint256 _value) external view returns (uint256 sqrt) {
        uint z = (_value + 1) / 2;
        sqrt = _value;
        while (z < sqrt) {
            sqrt = z;
            z = (_value / z + z) / 2;
        }
    }
}
