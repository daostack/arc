pragma solidity ^0.5.16;


library StringUtil {

    function hashCompareWithLengthCheck(string memory _a, string memory _b) internal returns (bool) {

        if (bytes(_a).length != bytes(_b).length) {
            return false;
        } else {
            return keccak256(abi.encodePacked(_a)) == keccak256(abi.encodePacked(_b));
        }
    }
}
