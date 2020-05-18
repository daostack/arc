pragma solidity ^0.5.17;

import "../controller/Avatar.sol";
import "@daostack/infra-experimental/contracts/votingMachines/GenesisProtocol.sol";
import "@daostack/infra-experimental/contracts/votingMachines/IntVoteInterface.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "../utils/DAOFactory.sol";
import "../libs/StringUtil.sol";


contract ArcScheme is Initializable {
    using StringUtil for string;
    Avatar public avatar;
    IntVoteInterface public votingMachine;

    string public constant GENESIS_PROTOCOL_INIT_FUNC_SIGNATURE =
    "initialize(address,uint256[11],address,address,address,address)";

    string public constant ABSOLUTE_VOTE_INIT_FUNC_SIGNATURE =
    "initialize(uint256,address,address,address,address)";

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
     * @dev _initializeGovernance
     * @param _avatar the scheme avatar
     * @param _votingParams genesisProtocol parameters - valid only if _voteParamsHash is zero
     * @param _addresses array of addresses
     *       addresses[0] - _daoFactory DAOFactory instance to instance a votingMachine.
     *       addresses[1] - _voteOnBehalf  parameter
     *       addresses[2] - _organization organization
     *       addresses[3] - _callbacks should fulfill voting callbacks interface
     *       addresses[4] - _authorizedToPropose only this address allow to propose (unless it is zero)
     *       addresses[5] - _stakingToken (for GenesisProtocol)
     * @param _packageVersion packageVersion to instance the votingMachine from.
     * @param _votingMachineName the votingMachine contract name.
     */
    function _initializeGovernance(
        Avatar _avatar,
        uint256[11] memory _votingParams,
        address[6] memory _addresses,
        uint64[3] memory _packageVersion,
        string memory _votingMachineName
    ) internal
    {
        require(_addresses[0] != address(0), "daoFactory cannot be zero");
        _initialize(_avatar);
        bytes memory initData;
        if (_votingMachineName.hashCompareWithLengthCheck("GenesisProtocol")) {
            initData = abi.encodeWithSignature(
                GENESIS_PROTOCOL_INIT_FUNC_SIGNATURE,
                _addresses[5],
                _votingParams,
                _addresses[1],
                _addresses[2],
                _addresses[3],
                _addresses[4]);
        } else {
            initData = abi.encodeWithSignature(
                    ABSOLUTE_VOTE_INIT_FUNC_SIGNATURE,
                    _votingParams[0],
                    _addresses[1],
                    _addresses[2],
                    _addresses[3],
                    _addresses[4]);
        }
        votingMachine = IntVoteInterface(address(DAOFactory(_addresses[0]).createInstance(
                            _packageVersion,
                            _votingMachineName,
                            address(avatar),
                            initData)));

    }
}
