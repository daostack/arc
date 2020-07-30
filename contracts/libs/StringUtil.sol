pragma solidity ^0.6.12;
// SPDX-License-Identifier: GPL-3.0


library StringUtil {

    function hashCompareWithLengthCheck(string memory _a, string memory _b) internal pure returns (bool) {

        if (bytes(_a).length != bytes(_b).length) {
            return false;
        } else {
            return keccak256(abi.encodePacked(_a)) == keccak256(abi.encodePacked(_b));
        }
    }
}
