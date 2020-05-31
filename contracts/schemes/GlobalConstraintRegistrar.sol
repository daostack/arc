pragma solidity ^0.5.17;

import "@daostack/infra-experimental/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra-experimental/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "../votingMachines/VotingMachineCallbacks.sol";


/**
 * @title A scheme to manage global constraint for organizations
 * @dev The scheme is used to register or remove new global constraints
 */
contract GlobalConstraintRegistrar is VotingMachineCallbacks, ProposalExecuteInterface {

    event NewGlobalConstraintsProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        address _gc,
        string _descriptionHash
    );

    event RemoveGlobalConstraintsProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        address _gc,
        string _descriptionHash
    );

    event ProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId, int256 _param);
    event ProposalDeleted(address indexed _avatar, bytes32 indexed _proposalId);

    // The struct that holds the information of a global constraint proposed to be added or removed.
    struct GCProposal {
        address gc; // The address of the global constraint contract.
        bool addGC; // true: add a GC, false: remove a GC.
    }

    // GCProposal by avatar and proposalId
    mapping(bytes32=>GCProposal) public organizationProposals;

    /**
     * @dev initialize
     * @param _avatar the avatar this scheme referring to.
     * @param _votingParams genesisProtocol parameters
     * @param _voteOnBehalf  parameter
     * @param _daoFactory  DAOFactory instance to instance a votingMachine.
     * @param _stakingToken (for GenesisProtocol)
     * @param _packageVersion packageVersion to instance the votingMachine from.
     * @param _votingMachineName the votingMachine contract name.
     */
    function initialize(
        Avatar _avatar,
        uint256[11] calldata _votingParams,
        address _voteOnBehalf,
        DAOFactory _daoFactory,
        address _stakingToken,
        uint64[3] calldata _packageVersion,
        string calldata _votingMachineName
    )
    external
    {
        super._initializeGovernance(
            _avatar,
            _votingParams,
            _voteOnBehalf,
            _daoFactory,
            _stakingToken,
            address(this),
            address(this),
            address(this),
            _packageVersion,
            _votingMachineName);
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _decision the voting result, 1 yes and 2 is no.
    * @return bool which represents a successful of the function.
    */
    function executeProposal(bytes32 _proposalId, int256 _decision)
    external
    onlyVotingMachine(_proposalId)
    returns(bool) {
        bool retVal = true;

        // Check if vote was successful:
        GCProposal memory proposal = organizationProposals[_proposalId];

        require(proposal.gc != address(0));
        delete organizationProposals[_proposalId];
        emit ProposalDeleted(address(avatar), _proposalId);

        if (_decision == 1) {

        // Define controller and get the params:
            Controller controller = Controller(avatar.owner());

        // Adding a GC
            if (proposal.addGC) {
                retVal = controller.addGlobalConstraint(proposal.gc);
            }
        // Removing a GC
            if (!proposal.addGC) {
                retVal = controller.removeGlobalConstraint(proposal.gc);
            }
        }
        emit ProposalExecuted(address(avatar), _proposalId, _decision);
        return retVal;
    }

    /**
    * @dev propose to add a new global constraint:
    * @param _gc the address of the global constraint that is being proposed
    * @param _descriptionHash proposal's description hash
    * @return bytes32 -the proposal id
    */
    function proposeGlobalConstraint(
    address _gc,
    string calldata _descriptionHash
    )
    external
    returns(bytes32)
    {
        bytes32 proposalId = votingMachine.propose(2, msg.sender);

        GCProposal memory proposal = GCProposal({
            gc: _gc,
            addGC: true
        });

        organizationProposals[proposalId] = proposal;
        emit NewGlobalConstraintsProposal(
            address(avatar),
            proposalId,
            address(votingMachine),
            _gc,
            _descriptionHash
        );
        proposalsBlockNumber[proposalId] = block.number;
        return proposalId;
    }

    /**
    * @dev propose to remove a global constraint:
    * @param _gc the address of the global constraint that is being proposed
    * @param _descriptionHash proposal's description hash
    * @return bytes32 -the proposal id
    */
    function proposeToRemoveGC(address _gc, string memory _descriptionHash) public returns(bytes32) {
        Controller controller = Controller(avatar.owner());
        require(controller.isGlobalConstraintRegistered(_gc), "proposed gc is not register");
        bytes32 proposalId = votingMachine.propose(2, msg.sender);

        GCProposal memory proposal = GCProposal({
            gc: _gc,
            addGC: false
        });

        organizationProposals[proposalId] = proposal;
        emit RemoveGlobalConstraintsProposal(
        address(avatar),
        proposalId,
        address(votingMachine),
        _gc,
        _descriptionHash);

        proposalsBlockNumber[proposalId] = block.number;
        return proposalId;
    }
}
