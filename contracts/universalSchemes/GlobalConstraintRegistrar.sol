pragma solidity ^0.4.18;

import "../VotingMachines/IntVoteInterface.sol";
import "./UniversalScheme.sol";


/**
 * @title A scheme to manage global constraint for organizations
 * @dev The scheme is used to register or remove new global constraints
 */
contract GlobalConstraintRegistrar is UniversalScheme {
    event NewGlobalConstraintsProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        address _gc,
        bytes32 _params,
        bytes32 _voteToRemoveParams
    );
    event RemoveGlobalConstraintsProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        address _gc
    );
    event ProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId);
    event LogProposalDeleted(address indexed _avatar, bytes32 indexed _proposalId);

    // The struct that holds the information of a global constraint proposed to be added or removed.
    struct GCProposal {
        address gc; // The address of the global constraint contract.
        bytes32 params; // Parameters for global constraint.
        uint proposalType; // 1: add a GC, 2: remove a GC.
        bytes32 voteToRemoveParams; // Voting parameters for removing this GC.
    }

    // Struct holding the data for each organization
    struct Organization {
        bytes32 voteRegisterParams; // The voting parameters for adding a GC.
        IntVoteInterface intVote; // The voting machine in which the voting takes place.
        mapping(bytes32=>GCProposal) proposals; // A mapping from the proposal ID to the proposal itself.
        mapping(address=>bytes32) voteToRemoveParams; // A mapping that saves the parameters for removing each GC.
    }

    // A mapping from thr organization (Avatar) address to the saved data of the organization:
    mapping(address=>Organization) public organizationsData;

    // A mapping from hashes to parameters (use to store a particular configuration on the controller)
    struct Parameters {
        bytes32 voteRegisterParams;
        IntVoteInterface intVote;
    }

    mapping(bytes32=>Parameters) public parameters;

    /**
     * @dev Constructor
     */
    function GlobalConstraintRegistrar() public {}

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
        return (keccak256(_voteRegisterParams, _intVote));
    }

    /**
    * @dev propose to add a new global constraint:
    * @param _avatar the avatar of the organization that the constraint is proposed for
    * @param _gc the address of the global constraint that is being proposed
    * @param _params the parameters for the global constraint
    * @param _voteToRemoveParams the conditions (on the voting machine) for removing this global constraint
    * @return bytes32 -the proposal id
    */
    // TODO: do some checks on _voteToRemoveParams - it is very easy to make a mistake and not be able to remove the GC
    function proposeGlobalConstraint(Avatar _avatar, address _gc, bytes32 _params, bytes32 _voteToRemoveParams)
    public
    returns(bytes32)
    {
        Parameters memory votingParams = parameters[getParametersFromController(_avatar)];

        IntVoteInterface intVote = votingParams.intVote;
        bytes32 proposalId = intVote.propose(2, votingParams.voteRegisterParams, _avatar, ExecutableInterface(this));

        GCProposal memory proposal = GCProposal({
            gc: _gc,
            params: _params,
            proposalType: 1,
            voteToRemoveParams: _voteToRemoveParams
        });

        organizationsData[_avatar].proposals[proposalId] = proposal;
        NewGlobalConstraintsProposal(
            _avatar,
            proposalId,
            intVote,
            _gc,
            _params,
            _voteToRemoveParams
        );
        intVote.ownerVote(proposalId, 1, msg.sender); // Automatically votes `yes` in the name of the opener.
        return proposalId;
    }

    /**
    * @dev propose to remove a global constraint:
    * @param _avatar the avatar of the organization that the constraint is proposed for
    * @param _gc the address of the global constraint that is being proposed
    * @return bytes32 -the proposal id
    */
    function proposeToRemoveGC(Avatar _avatar, address _gc) public returns(bytes32) {
        Organization storage org = organizationsData[_avatar];
        Controller controller = Controller(Avatar(_avatar).owner());
        require(controller.isGlobalConstraintRegister(_gc,address(_avatar)));
        Parameters memory params = parameters[getParametersFromController(_avatar)];
        IntVoteInterface intVote = params.intVote;
        bytes32 proposalId = intVote.propose(2, org.voteToRemoveParams[_gc], _avatar, ExecutableInterface(this));

        GCProposal memory proposal = GCProposal({
            gc: _gc,
            params: 0,
            proposalType: 2,
            voteToRemoveParams: 0
        });

        organizationsData[_avatar].proposals[proposalId] = proposal;
        RemoveGlobalConstraintsProposal(_avatar, proposalId, intVote, _gc);
        intVote.ownerVote(proposalId, 1, msg.sender); // Automatically votes `yes` in the name of the opener.
        return proposalId;
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _avatar address of the controller
    * @param _param a parameter of the voting result, 0 is no and 1 is yes.
    * @return bool which represents a successful of the function.
    */
    function execute(bytes32 _proposalId, address _avatar, int _param) external returns(bool) {
        // Check the caller is indeed the voting machine:

        require(parameters[getParametersFromController(Avatar(_avatar))].intVote == msg.sender);
        bool retVal = true;
        // Check if vote was successful:
        if (_param == 1 ) {

        // Define controller and get the params:
            ControllerInterface controller = ControllerInterface(Avatar(_avatar).owner());
            GCProposal memory proposal = organizationsData[_avatar].proposals[_proposalId];
        // Adding a GC
            if (proposal.proposalType == 1) {
                retVal = controller.addGlobalConstraint(proposal.gc, proposal.params,_avatar);
                organizationsData[_avatar].voteToRemoveParams[proposal.gc] = proposal.voteToRemoveParams;
              }
        // Removing a GC
            if (proposal.proposalType == 2) {
                retVal = controller.removeGlobalConstraint(proposal.gc,_avatar);
              }
        }
        delete organizationsData[_avatar].proposals[_proposalId];
        ProposalExecuted(_avatar, _proposalId);
        return retVal;
    }
}
