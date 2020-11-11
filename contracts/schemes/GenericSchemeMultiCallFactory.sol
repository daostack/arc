pragma solidity 0.5.17;

import "./GenericSchemeMultiCall.sol";
import "./SimpleSchemeConstraints.sol";

/**
 * @title 
 */
contract GenericSchemeMultiCallFactory {
    uint8 public constant CUSTOM = 0;
    uint8 public constant FAST = 1;
    uint8 public constant NORMAL = 2;
    uint8 public constant SLOW = 3;

    function createGenericSchemeMultiCallSimple(
        Avatar _avatar,
        IntVoteInterface _votingMachine,
        uint8 _voteParamsType,
        bytes32 _voteParamsHash,
        address[] memory _contractsWhiteList,
        string memory _descriptionHash
    ) public returns(address) {
        GenericSchemeMultiCall genericSchemeMultiCall = new GenericSchemeMultiCall();
        address simpleSchemeConstraints;
        if (_contractsWhiteList.length > 0) {
            simpleSchemeConstraints = new SimpleSchemeConstraints();
            SimpleSchemeConstraints(simpleSchemeConstraints).initialize(_contractsWhiteList, _descriptionHash);
        }
        
        bytes32 voteParams;
        if (_voteParamsType == FAST) {
            // Fast params hash
            voteParams = bytes32(0x1b46f925b15bc0590168247d8df7f72773ca64dec3334183b5387dd3945f7f2e);
        } else if (_voteParamsType == NORMAL) {
            // Normal params hash
            voteParams = bytes32(0x2dfa7be2af300c250ab9037a744295d497648ab65f4f27baec5cb0e1d7784240);
        } else if (_voteParamsType == SLOW) {
            // Slow params hash
            voteParams = bytes32(0x5d5931d5f0f6e9dc16afe1b3af57b44f5a83c2c731f372b0294c348a920362ff);
        } else {
            // Custom params hash
            voteParams = _voteParamsHash;
        }
        genericSchemeMultiCall.initialize(
            _avatar, _votingMachine, voteParams, simpleSchemeConstraints
        );
        return address(genericSchemeMultiCall);
    }
}
