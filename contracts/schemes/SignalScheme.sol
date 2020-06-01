pragma solidity ^0.5.17;

import "@daostack/infra-experimental/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra-experimental/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "../votingMachines/VotingMachineCallbacks.sol";
import "../controller/Avatar.sol";


/**
 * @title A scheme for proposing a signal on behalkf of the dao
 */
contract SignalScheme is VotingMachineCallbacks, ProposalExecuteInterface {

    event NewSignalProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        uint256 indexed _signalType,
        string _descriptionHash
    );

    event Signal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        uint256 indexed _signalType,
        string _descriptionHash
    );

    struct Proposal {
        string descriptionHash;
        bool executed;
    }

    uint256 public signalType;

    mapping(bytes32  =>  Proposal) public proposals;

    /**
     * @dev initialize
     * @param _avatar the avatar this scheme referring to.
     * @param _votingParams genesisProtocol parameters
     * @param _voteOnBehalf  parameter
     * @param _daoFactory  DAOFactory instance to instance a votingMachine.
     * @param _stakingToken (for GenesisProtocol)
     * @param _packageVersion packageVersion to instance the votingMachine from.
     * @param _votingMachineName the votingMachine contract name.
     * @param _signalType - signal types
     */
    function initialize(
        Avatar _avatar,
        uint256[11] calldata _votingParams,
        address _voteOnBehalf,
        DAOFactory _daoFactory,
        address _stakingToken,
        uint64[3] calldata _packageVersion,
        string calldata _votingMachineName,
        uint256 _signalType)
    external
    initializer {
        super._initializeGovernance(
            _avatar,
            _votingParams,
            _voteOnBehalf,
            _daoFactory,
            _stakingToken,
            address(this),
            address(this),
            _packageVersion,
            _votingMachineName);
        signalType = _signalType;
    }

    /**
    * @dev Submit a proposal for a dao signal
    * @param _descriptionHash A hash of the proposal's description
    */
    function proposeSignal(
        string calldata _descriptionHash
    )
    external
    returns(bytes32 proposalId)
    {
        require(Controller(avatar.owner()).isSchemeRegistered(address(this)),
        "scheme is not registered");

        proposalId = votingMachine.propose(2, msg.sender);

        proposals[proposalId].descriptionHash = _descriptionHash;

        emit NewSignalProposal(
            address(avatar),
            proposalId,
            signalType,
            _descriptionHash
        );

        proposalsBlockNumber[proposalId] = block.number;
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _param a parameter of the voting result, 1 yes and 2 is no.
    */
    function executeProposal(bytes32 _proposalId, int256 _param) external onlyVotingMachine(_proposalId) returns(bool) {
        require(!proposals[_proposalId].executed);
        proposals[_proposalId].executed = true;
        // Check if vote was successful:
        if (_param == 1) {
            emit Signal(address(avatar),
                        _proposalId,
                        signalType,
                        proposals[_proposalId].descriptionHash);
        }
        return true;
    }
}
