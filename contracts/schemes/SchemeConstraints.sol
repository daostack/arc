pragma solidity 0.5.17;
pragma experimental ABIEncoderV2;
import "../controller/Avatar.sol";


contract SchemeConstraints {

    address[] public contractsWhiteList;

   /*
    * @dev isAllowedToCall should be called upon a proposal execution.
    * @param _contractsToCall the contracts to be called
    * @param _callsData - The abi encode data for the calls
    * @param _values value(ETH) to transfer with the calls
    * @param _avatar avatar
    * @return bool value true-allowed false not allowed
    */
    function isAllowedToCall(
        address[] calldata _contractsToCall,
        bytes[] calldata _callsData,
        uint256[] calldata _values,
        Avatar _avatar)
    external returns(bool);

    /*
     * @dev isAllowedToPropose should be called upon a proposal submition.
     * @param _contractsToCall the contracts to be called
     * @param _callsData - The abi encode data for the calls
     * @param _values value(ETH) to transfer with the calls
     * @param _avatar avatar
     * @return bool value true-allowed false not allowed
     */
    function isAllowedToPropose(
        address[] calldata _contractsToCall,
        bytes[] calldata _callsData,
        uint256[] calldata _values,
        Avatar _avatar)
    external returns(bool);

    function getContractsWhiteList() external view returns(address[] memory) {
        return contractsWhiteList;
    }

}
