pragma solidity ^0.5.11;

import "@daostack/infra-experimental/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra-experimental/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "../votingMachines/VotingMachineCallbacks.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";


/**
 * @title A scheme to manage global constraint for organizations
 * @dev The scheme is used to register or remove new global constraints
 */
contract GlobalConstraintRegistrar is Initializable, VotingMachineCallbacks, ProposalExecuteInterface {
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

    IntVoteInterface public votingMachine;
    bytes32 public voteParams;
    Avatar public avatar;

    /**
     * @dev initialize
     * @param _avatar the avatar this scheme referring to.
     * @param _votingMachine the voting machines address to
     * @param _voteParams voting machine parameters.
     */
    function initialize(
        Avatar _avatar,
        IntVoteInterface _votingMachine,
        bytes32 _voteParams
    )
    external
    initializer
    {
        require(_avatar != Avatar(0), "avatar cannot be zero");
        avatar = _avatar;
        votingMachine = _votingMachine;
        voteParams = _voteParams;
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
    bytes32 _voteToRemoveParams,
    string memory _descriptionHash)
    public
    returns(bytes32)
    {
        bytes32 proposalId = votingMachine.propose(2, voteParams, msg.sender, address(avatar));

        GCProposal memory proposal = GCProposal({
            gc: _gc,
            addGC: true,
            voteToRemoveParams: _voteToRemoveParams
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
        proposalsInfo[address(votingMachine)][proposalId] = ProposalInfo({
            blockNumber:block.number,
            avatar:avatar
        });
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
        require(controller.isGlobalConstraintRegistered(_gc));
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

        proposalsInfo[address(votingMachine)][proposalId] = ProposalInfo({
            blockNumber: block.number,
            avatar: avatar
        });
        return proposalId;
    }
}
