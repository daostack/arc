pragma solidity 0.5.17;
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
