pragma solidity ^0.5.17;


library StringUtil {

    function hashCompareWithLengthCheck(string memory _a, string memory _b) internal pure returns (bool) {

        if (bytes(_a).length != bytes(_b).length) {
            return false;
        } else {
            return keccak256(abi.encodePacked(_a)) == keccak256(abi.encodePacked(_b));
        }
    }
}
