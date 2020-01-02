pragma solidity 0.5.15;

import "@daostack/infra-experimental/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra-experimental/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "../votingMachines/VotingMachineCallbacks.sol";
import "../libs/DAOCallerHelper.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";


/**
 * @title A scheme for proposing a signal on behalkf of the daoCreator
 */

contract SignalScheme is VotingMachineCallbacks, ProposalExecuteInterface, Initializable {

    event NewSignalProposal(
        address indexed _dao,
        bytes32 indexed _proposalId,
        uint256 indexed _signalType,
        string _descriptionHash
    );

    event Signal(
        address indexed _dao,
        bytes32 indexed _proposalId,
        uint256 indexed _signalType,
        string _descriptionHash
    );

    struct Proposal {
        string descriptionHash;
        bool executed;
    }

    struct Parameters {
        bytes32 voteApproveParams;
        IntVoteInterface intVote;
        uint256 signalType;
        DAO dao;
    }

    mapping(bytes32  =>  Proposal) public proposals;

    Parameters public params;

    /**
     * @dev initialize
     * @param  _dao the scheme dao
     * @param _signalType - signal types
     * @param _voteApproveParams voting machine params
     * @param _intVote  voting machine address
     */
    function initialize(DAO _dao,
                        uint256 _signalType,
                        bytes32 _voteApproveParams,
                        IntVoteInterface _intVote)
    external
    initializer {
        require(_dao != DAO(0), "dao cannot be zero");
        params = Parameters({
            voteApproveParams: _voteApproveParams,
            signalType: _signalType,
            intVote: _intVote,
            dao: _dao
        });
    }

    /**
    * @dev Submit a proposal for a dao signal
    * @param _descriptionHash A hash of the proposal's description
    */
    function proposeSignal(
        string calldata _descriptionHash
    )
    external
    returns(bytes32)
    {
        require(params.dao.actorsRegistry().actorsRegistry(address(this)),
        "scheme is not registered");

        bytes32 proposalId = params.intVote.propose(
        2,
        params.voteApproveParams,
        msg.sender,
        address(params.dao)
        );

        proposals[proposalId].descriptionHash = _descriptionHash;

        emit NewSignalProposal(
            address(params.dao),
            proposalId,
            params.signalType,
            _descriptionHash
        );

        proposalsInfo[address(params.intVote)][proposalId] = ProposalInfo({
            blockNumber:block.number,
            dao:params.dao
        });
        return proposalId;
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
            emit Signal(address(params.dao),
                        _proposalId,
                        params.signalType,
                        proposals[_proposalId].descriptionHash);
        }
        return true;
    }
}
