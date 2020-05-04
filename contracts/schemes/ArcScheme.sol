pragma solidity ^0.5.17;

import "../controller/Avatar.sol";
import "@daostack/infra-experimental/contracts/votingMachines/GenesisProtocol.sol";
import "@daostack/infra-experimental/contracts/votingMachines/IntVoteInterface.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";


contract ArcScheme is Initializable {
    Avatar public avatar;
    IntVoteInterface public votingMachine;
    bytes32 public voteParamsHash;

    /**
     * @dev _initialize
     * @param _avatar the scheme avatar
     */
    function _initialize(Avatar _avatar) internal initializer
    {
        require(address(_avatar) != address(0), "Scheme must have avatar");
        avatar = _avatar;
    }

    /**
     * @dev _initialize
     * @param _avatar the scheme avatar
     * @param _votingMachine the scheme voting machine
     * @param _voteParamsHash the scheme vote params
     * @param _votingParams genesisProtocol parameters - valid only if _voteParamsHash is zero
     * @param _voteOnBehalf genesisProtocol parameter - valid only if _voteParamsHash is zero
     */
    function _initializeGovernance(
        Avatar _avatar,
        IntVoteInterface _votingMachine,
        bytes32 _voteParamsHash,
        uint256[11] memory _votingParams,
        address _voteOnBehalf
    ) internal
    {
        require(_votingMachine != IntVoteInterface(0), "votingMachine cannot be zero");
        _initialize(_avatar);
        votingMachine = _votingMachine;
        if (_voteParamsHash == bytes32(0)) {
            //genesisProtocol
            GenesisProtocol genesisProtocol = GenesisProtocol(address(_votingMachine));
            voteParamsHash = genesisProtocol.getParametersHash(_votingParams, _voteOnBehalf);
            (uint256 queuedVoteRequiredPercentage, , , , , , , , , , , ,) =
            genesisProtocol.parameters(voteParamsHash);
            if (queuedVoteRequiredPercentage == 0) {
               //params not set already
                genesisProtocol.setParameters(_votingParams, _voteOnBehalf);
            }
        } else {
            //for other voting machines
            voteParamsHash = _voteParamsHash;
        }
    }
}
