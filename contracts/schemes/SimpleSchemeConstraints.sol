pragma solidity 0.5.17;
pragma experimental ABIEncoderV2;

import "./SchemeConstraints.sol";

//a simple genericSchemeMultiCall constraint which put constraints only on white listed contracts to call.

contract SimpleSchemeConstraints is SchemeConstraints {

    mapping(address=>bool) public contractsWhiteListMap;
    bool public initialized;

    /* @dev initialize
     * @param _contractsWhiteList the contracts the scheme is allowed to interact with
     * @param _descriptionHash can be used to add detalis description of the constraints.
     */
    function initialize(
        address[] calldata _contractsWhiteList,
        string calldata _descriptionHash
    )
    external {
        require(!initialized, "cannot initialize twice");
        initialized = true;
        for (uint i = 0; i < _contractsWhiteList.length; i++) {
            contractsWhiteListMap[_contractsWhiteList[i]] = true;
        }
        contractsWhiteList = _contractsWhiteList;
        descriptionHash = _descriptionHash;
    }

    /*
     * @dev isAllowedToCall should be called upon a proposal execution.
     * @param _contractsToCall the contracts to be called
     * @return bool value true-allowed false not allowed
     */
    function isAllowedToCall(
        address[] calldata _contractsToCall,
        bytes[] calldata,
        uint256[] calldata,
        Avatar
    )
    external
    returns(bool)
    {
        for (uint i = 0; i < _contractsToCall.length; i++) {
            require(contractsWhiteListMap[_contractsToCall[i]], "contract not whitelisted");
        }
        return true;
    }

    /*
     * @dev isAllowedToPropose should be called upon a proposal submition.
     * @param _contractsToCall the contracts to be called
     * @return bool value true-allowed false not allowed
     */
    function isAllowedToPropose(
        address[] calldata _contractsToCall,
        bytes[] calldata,
        uint256[] calldata,
        Avatar)
    external
    returns(bool)
    {
        for (uint i = 0; i < _contractsToCall.length; i++) {
            require(contractsWhiteListMap[_contractsToCall[i]], "contract not whitelisted");
        }
        return true;
    }
}
