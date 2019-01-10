pragma solidity ^0.5.2;

import "@daostack/infra/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "./UniversalScheme.sol";
import "../votingMachines/VotingMachineCallbacks.sol";



/**
 * @title A scheme to manage global constraint for organizations
 * @dev The scheme is used to register or remove new global constraints
 */
contract GlobalConstraintRegistrar is UniversalScheme, VotingMachineCallbacks, ProposalExecuteInterface {
    event NewGlobalConstraintsProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        address _gc,
        bytes32 _params,
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

    // The struct that holds the information of a global constraint proposed to be added or removed.
    struct GCProposal {
        address gc; // The address of the global constraint contract.
        bool addGC; // true: add a GC, false: remove a GC.
        bytes32 params; // Parameters for global constraint.
        bytes32 voteToRemoveParams; // Voting parameters for removing this GC.
    }

    // GCProposal by avatar and proposalId
    mapping(address=>mapping(bytes32=>GCProposal)) public organizationsProposals;

    // voteToRemoveParams hash by avatar and proposal.gc
    mapping(address=>mapping(address=>bytes32)) public voteToRemoveParams;

    // A mapping from hashes to parameters (use to store a particular configuration on the controller)
    struct Parameters {
        bytes32 voteRegisterParams;
        IntVoteInterface intVote;
    }

    mapping(bytes32=>Parameters) public parameters;

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _param a parameter of the voting result, 1 yes and 2 is no.
    * @return bool which represents a successful of the function.
    */
    function executeProposal(bytes32 _proposalId, int256 _param) external onlyVotingMachine(_proposalId) returns(bool) {
        Avatar avatar = proposalsInfo[_proposalId].avatar;
        bool retVal = true;
        // Check if vote was successful:
        GCProposal memory proposal = organizationsProposals[address(avatar)][_proposalId];
        require(proposal.gc != address(0));
        delete organizationsProposals[address(avatar)][_proposalId];
        emit ProposalDeleted(address(avatar), _proposalId);

        if (_param == 1) {

        // Define controller and get the params:
            ControllerInterface controller = ControllerInterface(avatar.owner());

        // Adding a GC
            if (proposal.addGC) {
                retVal = controller.addGlobalConstraint(proposal.gc, proposal.params, address(avatar));
                voteToRemoveParams[address(avatar)][proposal.gc] = proposal.voteToRemoveParams;
            }
        // Removing a GC
            if (!proposal.addGC) {
                retVal = controller.removeGlobalConstraint(proposal.gc, address(avatar));
            }
        }
        emit ProposalExecuted(address(avatar), _proposalId, _param);
        return retVal;
    }

    /**
    * @dev Hash the parameters, save them if necessary, and return the hash value
    * @param _voteRegisterParams -  voting parameters for register global constraint
    * @param _intVote  - voting machine contract.
    * @return bytes32 -the parameters hash
    */
    function setParameters(
        bytes32 _voteRegisterParams,
        IntVoteInterface _intVote
    ) public returns(bytes32)
    {
        bytes32 paramsHash = getParametersHash(_voteRegisterParams, _intVote);
        parameters[paramsHash].voteRegisterParams = _voteRegisterParams;
        parameters[paramsHash].intVote = _intVote;
        return paramsHash;
    }

    /**
    * @dev Hash the parameters and return the hash value
    * @param _voteRegisterParams -  voting parameters
    * @param _intVote  - voting machine contract.
    * @return bytes32 -the parameters hash
    */
    function getParametersHash(
        bytes32 _voteRegisterParams,
        IntVoteInterface _intVote
    ) public pure returns(bytes32)
    {
        return (keccak256(abi.encodePacked(_voteRegisterParams, _intVote)));
    }

    /**
    * @dev propose to add a new global constraint:
    * @param _avatar the avatar of the organization that the constraint is proposed for
    * @param _gc the address of the global constraint that is being proposed
    * @param _params the parameters for the global constraint
    * @param _voteToRemoveParams the conditions (on the voting machine) for removing this global constraint
    * @param _descriptionHash proposal's description hash
    * @return bytes32 -the proposal id
    */
    // TODO: do some checks on _voteToRemoveParams - it is very easy to make a mistake and not be able to remove the GC
    function proposeGlobalConstraint(
    Avatar _avatar,
    address _gc,
    bytes32 _params,
    bytes32 _voteToRemoveParams,
    string memory _descriptionHash)
    public
    returns(bytes32)
    {
        Parameters memory votingParams = parameters[getParametersFromController(_avatar)];

        IntVoteInterface intVote = votingParams.intVote;
        bytes32 proposalId = intVote.propose(2, votingParams.voteRegisterParams, msg.sender, address(_avatar));

        GCProposal memory proposal = GCProposal({
            gc: _gc,
            params: _params,
            addGC: true,
            voteToRemoveParams: _voteToRemoveParams
        });

        organizationsProposals[address(_avatar)][proposalId] = proposal;
        emit NewGlobalConstraintsProposal(
            address(_avatar),
            proposalId,
            address(intVote),
            _gc,
            _params,
            _voteToRemoveParams,
            _descriptionHash
        );
        proposalsInfo[proposalId] = ProposalInfo({
            blockNumber:block.number,
            avatar:_avatar,
            votingMachine:address(intVote)
        });
        return proposalId;
    }

    /**
    * @dev propose to remove a global constraint:
    * @param _avatar the avatar of the organization that the constraint is proposed for
    * @param _gc the address of the global constraint that is being proposed
    * @param _descriptionHash proposal's description hash
    * @return bytes32 -the proposal id
    */
    function proposeToRemoveGC(Avatar _avatar, address _gc, string memory _descriptionHash) public returns(bytes32) {
        ControllerInterface controller = ControllerInterface(_avatar.owner());
        require(controller.isGlobalConstraintRegistered(_gc, address(_avatar)));
        Parameters memory params = parameters[getParametersFromController(_avatar)];
        IntVoteInterface intVote = params.intVote;
        bytes32 proposalId = intVote.propose(
        2,
        voteToRemoveParams[address(_avatar)][_gc],
        msg.sender,
        address(_avatar)
        );

        GCProposal memory proposal = GCProposal({
            gc: _gc,
            params: 0,
            addGC: false,
            voteToRemoveParams: 0
        });

        organizationsProposals[address(_avatar)][proposalId] = proposal;
        emit RemoveGlobalConstraintsProposal(address(_avatar), proposalId, address(intVote), _gc, _descriptionHash);
        proposalsInfo[proposalId] = ProposalInfo({
            blockNumber:block.number,
            avatar:_avatar,
            votingMachine:address(intVote)
        });
        return proposalId;
    }
}
