pragma solidity 0.5.17;

import "../schemes/GenericSchemeMultiCall.sol";
import "../schemes/SimpleSchemeConstraints.sol";
import "@daostack/infra/contracts/votingMachines/GenesisProtocol.sol";

/**
 * @title 
 */
contract GenericSchemeMultiCallFactory {
    uint8 public constant CUSTOM = 0;
    uint8 public constant FAST = 1;
    uint8 public constant NORMAL = 2;
    uint8 public constant SLOW = 3;

    event NewGenericSchemeMultiCall(address genericSchemeMultiCall);

    function createGenericSchemeMultiCallSimple(
        Avatar _avatar,
        IntVoteInterface _votingMachine,
        uint8 _voteParamsType,
        uint256[11] memory _votingParams,
        address _voteOnBehalf,
        address[] memory _contractsWhiteList,
        string memory _descriptionHash
    ) public returns(address) {
        GenericSchemeMultiCall genericSchemeMultiCall = new GenericSchemeMultiCall();
        address simpleSchemeConstraints;
        if (_contractsWhiteList.length > 0) {
            simpleSchemeConstraints = address(new SimpleSchemeConstraints());
            SimpleSchemeConstraints(simpleSchemeConstraints).initialize(_contractsWhiteList, _descriptionHash);
        }
        
        uint256[11] memory voteParams;
        if (_voteParamsType == FAST) {
            // Fast params hash
            voteParams = [
                uint256(50),
                uint256(604800),
                uint256(129600),
                uint256(43200),
                uint256(1200),
                uint256(86400),
                uint256(10000000000000000000),
                uint256(1),
                uint256(50000000000000000000),
                uint256(10),
                uint256(0)
            ];
        } else if (_voteParamsType == NORMAL) {
            // Normal params hash
            voteParams = [
                uint256(50),
                uint256(2592000),
                uint256(345600),
                uint256(86400),
                uint256(1200),
                uint256(172800),
                uint256(50000000000000000000),
                uint256(4),
                uint256(150000000000000000000),
                uint256(10),
                uint256(0)
            ];
        } else if (_voteParamsType == SLOW) {
            // Slow params hash
            voteParams = [
                uint256(50),
                uint256(5184000),
                uint256(691200),
                uint256(172800),
                uint256(1500),
                uint256(345600),
                uint256(200000000000000000000),
                uint256(4),
                uint256(500000000000000000000),
                uint256(10),
                uint256(0)
            ];
        } else {
            // Custom params hash
            voteParams = _votingParams;
        }

        GenesisProtocol genesisProtocol = GenesisProtocol(address(_votingMachine));
        bytes32 voteParamsHash = genesisProtocol.getParametersHash(voteParams, _voteOnBehalf);
        (uint256 queuedVoteRequiredPercentage, , , , , , , , , , , ,) =
        genesisProtocol.parameters(voteParamsHash);
        if (queuedVoteRequiredPercentage == 0) {
            //params not set already
            genesisProtocol.setParameters(voteParams, _voteOnBehalf);
        }
        genericSchemeMultiCall.initialize(
            _avatar, _votingMachine, voteParamsHash, SchemeConstraints(simpleSchemeConstraints)
        );

        emit NewGenericSchemeMultiCall(address(genericSchemeMultiCall));
        return address(genericSchemeMultiCall);
    }
}
