pragma solidity ^0.6.12;
// SPDX-License-Identifier: GPL-3.0
pragma experimental ABIEncoderV2;
import "../controller/Avatar.sol";


interface SchemeConstraints {

    function isAllowedToCall(
        address[] calldata _contractsToCall,
        bytes[] calldata _callsData,
        uint256[] calldata _values,
        Avatar _avatar)
    external returns(bool);

    function isAllowedToPropose(
        address[] calldata _contractsToCall,
        bytes[] calldata _callsData,
        uint256[] calldata _values,
        Avatar _avatar)
    external returns(bool);

}
