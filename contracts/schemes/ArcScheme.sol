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
     * @param _voteOnBehalf  parameter
     * @param _daoFactory  DAOFactory instance to instance a votingMachine.
     * @param _stakingToken (for GenesisProtocol)
     * @param _organization organization
     * @param _callbacks should fulfill voting callbacks interface
     * @param _authorizedToPropose only this address allow to propose (unless it is zero)
     * @param _packageVersion packageVersion to instance the votingMachine from.
     * @param _votingMachineName the votingMachine contract name.
     */
    function _initializeGovernance(
        Avatar _avatar,
        uint256[11] memory _votingParams,
        address _voteOnBehalf,
        DAOFactory _daoFactory,
        address _stakingToken,
        address _organization,
        address _callbacks,
        address _authorizedToPropose,
        uint64[3] memory _packageVersion,
        string memory _votingMachineName
    ) internal
    {

        require(_daoFactory != DAOFactory(0), "daoFactory cannot be zero");
        _initialize(_avatar);
        bytes memory initData;
        if (_votingMachineName.hashCompareWithLengthCheck("GenesisProtocol")) {
            initData = abi.encodeWithSignature(
                GENESIS_PROTOCOL_INIT_FUNC_SIGNATURE,
                _stakingToken,
                _votingParams,
                _voteOnBehalf,
                _organization,
                _callbacks,
                _authorizedToPropose);
        } else {
            initData = abi.encodeWithSignature(
                    ABSOLUTE_VOTE_INIT_FUNC_SIGNATURE,
                    _votingParams[0],
                    _voteOnBehalf,
                    _organization,
                    _callbacks,
                    _authorizedToPropose);
        }
        votingMachine = IntVoteInterface(address(_daoFactory.createInstance(
                            _packageVersion,
                            _votingMachineName,
                            address(avatar),
                            initData)));

    }
}
