pragma solidity 0.5.15;

import "@daostack/infra-experimental/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra-experimental/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "../votingMachines/VotingMachineCallbacks.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";


/**
 * @title GenericScheme.
 * @dev  A scheme for proposing and executing calls to an arbitrary function
 * on a specific contract on behalf of the organization dao.
 */
contract GenericScheme is VotingMachineCallbacks, ProposalExecuteInterface, Initializable {
    using DAOCallerHelper for DAO;

    event NewCallProposal(
        address indexed _dao,
        bytes32 indexed _proposalId,
        bytes   _callData,
        uint256 _value,
        string  _descriptionHash
    );

    event ProposalExecuted(
        address indexed _dao,
        bytes32 indexed _proposalId,
        bytes _genericCallReturnValue
    );

    event ProposalExecutedByVotingMachine(
        address indexed _dao,
        bytes32 indexed _proposalId,
        int256 _param
    );

    event ProposalDeleted(address indexed _dao, bytes32 indexed _proposalId);

    // Details of a voting proposal:
    struct CallProposal {
        bytes callData;
        uint256 value;
        bool exist;
        bool passed;
    }

    mapping(bytes32=>CallProposal) public organizationProposals;

    IntVoteInterface public votingMachine;
    bytes32 public voteParams;
    address public contractToCall;
    DAO public dao;

    /**
     * @dev initialize
     * @param _dao the dao to mint reputation from
     * @param _votingMachine the voting machines address to
     * @param _voteParams voting machine parameters.
     * @param _contractToCall the target contract this scheme will call to
     */
    function initialize(
        DAO _dao,
        IntVoteInterface _votingMachine,
        bytes32 _voteParams,
        address _contractToCall
    )
    external
    initializer
    {
        require(_dao != DAO(0), "dao cannot be zero");
        dao = _dao;
        votingMachine = _votingMachine;
        voteParams = _voteParams;
        contractToCall = _contractToCall;
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _decision a parameter of the voting result, 1 yes and 2 is no.
    * @return bool success
    */
    function executeProposal(bytes32 _proposalId, int256 _decision)
    external
    onlyVotingMachine(_proposalId)
    returns(bool) {
        CallProposal storage proposal = organizationProposals[_proposalId];
        require(proposal.exist, "must be a live proposal");
        require(proposal.passed == false, "cannot execute twice");

        if (_decision == 1) {
            proposal.passed = true;
            execute(_proposalId);
        } else {
            delete organizationProposals[_proposalId];
            emit ProposalDeleted(address(dao), _proposalId);
        }

        emit ProposalExecutedByVotingMachine(address(dao), _proposalId, _decision);
        return true;
    }

    /**
    * @dev execution of proposals after it has been decided by the voting machine
    * @param _proposalId the ID of the voting in the voting machine
    */
    function execute(bytes32 _proposalId) public {
        CallProposal storage proposal = organizationProposals[_proposalId];
        require(proposal.exist, "must be a live proposal");
        require(proposal.passed, "proposal must passed by voting machine");
        proposal.exist = false;
        bytes memory genericCallReturnValue;
        bool success;
        (success, genericCallReturnValue) =
        dao.genericCall(contractToCall, proposal.callData, proposal.value);
        if (success) {
            delete organizationProposals[_proposalId];
            emit ProposalDeleted(address(dao), _proposalId);
            emit ProposalExecuted(address(dao), _proposalId, genericCallReturnValue);
        } else {
            proposal.exist = true;
        }
    }

    /**
    * @dev propose to call on behalf of the _dao
    *      The function trigger NewCallProposal event
    * @param _callData - The abi encode data for the call
    * @param _value value(ETH) to transfer with the call
    * @param _descriptionHash proposal description hash
    * @return an id which represents the proposal
    */
    function proposeCall(bytes memory _callData, uint256 _value, string memory _descriptionHash)
    public
    returns(bytes32)
    {
        bytes32 proposalId = votingMachine.propose(2, voteParams, msg.sender, address(dao));

        organizationProposals[proposalId] = CallProposal({
            callData: _callData,
            value: _value,
            exist: true,
            passed: false
        });
        proposalsInfo[address(votingMachine)][proposalId] = ProposalInfo({
            blockNumber:block.number,
            dao:dao
        });
        emit NewCallProposal(address(dao), proposalId, _callData, _value, _descriptionHash);
        return proposalId;
    }

}
