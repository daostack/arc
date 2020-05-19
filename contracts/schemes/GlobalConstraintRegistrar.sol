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
        bytes32 _voteToRemoveParams,
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
    event D(bool x);

    // The struct that holds the information of a global constraint proposed to be added or removed.
    struct GCProposal {
        address gc; // The address of the global constraint contract.
        bool addGC; // true: add a GC, false: remove a GC.
        bytes32 voteToRemoveParams; // Voting parameters for removing this GC.
    }

    // GCProposal by avatar and proposalId
    mapping(bytes32=>GCProposal) public organizationProposals;

    // voteToRemoveParams hash by avatar and proposal.gc
    mapping(address=>bytes32) public voteToRemoveParams;

    DAOFactory public daoFactory;
    address[6] public addresses;
    uint64[3] public packageVersion;
    string public votingMachineName;

    /**
     * @dev initialize
     * @param _avatar the avatar this scheme referring to.
     * @param _votingParams genesisProtocol parameters
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
    function initialize(
        Avatar _avatar,
        uint256[11] calldata _votingParams,
        address[6] calldata _addresses,
        uint64[3] calldata _packageVersion,
        string calldata _votingMachineName
    )
    external
    {
        super._initializeGovernance(_avatar, _votingParams, _addresses, _packageVersion, _votingMachineName);
        packageVersion = _packageVersion;
        votingMachineName = _votingMachineName;
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
                voteToRemoveParams[proposal.gc] = proposal.voteToRemoveParams;
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
    * @param _voteToRemoveParams the conditions (on the voting machine) for removing this global constraint
    * @param _descriptionHash proposal's description hash
    * @return bytes32 -the proposal id
    */
    function proposeGlobalConstraint(
    address _gc,
    string memory _descriptionHash,
    uint256[11] calldata _votingParams,
    address[6] calldata _addresses,
    uint64[3] calldata _packageVersion,
    string calldata _votingMachineName)
    public
    returns(bytes32)
    {
        bytes32 proposalId = votingMachine.propose(2, msg.sender);

        GCProposal memory proposal = GCProposal({
            gc: _gc,
            addGC: true,
            voteToRemoveParams: _voteToRemoveParams,
            votingParams: _votingParams,
            addresses: _addresses,
            packageVersion: _packageVersion,
            _votingMachineName:
        });

        organizationProposals[proposalId] = proposal;
        emit NewGlobalConstraintsProposal(
            address(avatar),
            proposalId,
            address(votingMachine),
            _gc,
            _voteToRemoveParams,
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
        bytes32 proposalId = votingMachine.propose(
        2,
        voteToRemoveParams[_gc],
        msg.sender,
        address(avatar)
        );

        GCProposal memory proposal = GCProposal({
            gc: _gc,
            addGC: false,
            voteToRemoveParams: 0
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
