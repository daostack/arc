pragma solidity ^0.4.18;

import "../VotingMachines/IntVoteInterface.sol";
import "./UniversalScheme.sol";


/**
 * @title A scheme to manage global constaintg for organizations
 * @dev The scheme is used to register or remove new global constraints
 */
contract GlobalConstraintRegistrar is UniversalScheme {
    event LogNewGlobalConstraintsProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        address _gc,
        bytes32 _params,
        bytes32 _removeParams
    );
    event LogRemoveGlobalConstraintsProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        address _gc
    );
    event LogProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId);
    event LogProposalDeleted(address indexed _avatar, bytes32 indexed _proposalId);

    // The struct that holds the information of a global constraint proposed to be added or removed.
    struct GCProposal {
        address gc; // The address of the global contraint contract.
        bytes32 params; // Parameters for global constraint.
        uint proposalType; // 1: add a GC, 2: remove a GC.
        bytes32 removeParams; // Voting parameters for removing this GC.
    }

    // Struct holding the data for each organization
    struct Organization {
        bool isRegistered;
        bytes32 voteRegisterParams; // The voting parameters for adding a GC.
        IntVoteInterface intVote; // The voting machine in which the voting takes place.
        mapping(bytes32=>GCProposal) proposals; // A mapping from the proposal ID to the proposal itself.
        mapping(address=>bytes32) removeParams; // A mapping that saves the parameters for removing each GC.
    }

    // A mapping from thr organization (Avatar) address to the saved data of the organization:
    mapping(address=>Organization) public organizations;

    // A mapping from hashes to parameters (use to store a particular configuration on the controller)
    struct Parameters {
        bytes32 voteRegisterParams;
        IntVoteInterface intVote;
    }
    mapping(bytes32=>Parameters) public parameters;

    function GlobalConstraintRegistrar(StandardToken _nativeToken, uint _fee, address _beneficiary) public {
        updateParameters(_nativeToken, _fee, _beneficiary, bytes32(0));
    }

    /**
    * @dev hash the parameters, save them if necessary, and return the hash value
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

    function getParametersHash(
        bytes32 _voteRegisterParams,
        IntVoteInterface _intVote
    ) public pure returns(bytes32)
    {
        bytes32 paramsHash = (keccak256(_voteRegisterParams, _intVote));
        return paramsHash;
    }

    // Adding an organization to the universal scheme:
    // TODO: probably we want to define registerOrganization and isRegistered in UniversalScheme
    function registerOrganization(Avatar _avatar) public {
        // Pay fees for using scheme:
        if ((fee > 0) && (! organizations[_avatar].isRegistered)) {
            nativeToken.transferFrom(_avatar, beneficiary, fee);
        }

        Organization memory org;
        org.isRegistered = true;
        organizations[_avatar] = org;
        LogOrgRegistered(_avatar);
    }

    function isRegistered(address _avatar) public constant returns(bool) {
        return organizations[_avatar].isRegistered;
    }

    /**
    * @dev propose to add a new global constraint:
    * @param _avatar the avatar of the organization that the constraint is proposed for
    * @param _gc the address of the global constraint that is being proposed
    * @param _params the parameters for the global contraint
    * @param _removeParams the conditions (on the voting machine) for removing this global constraint
    */
    // TODO: do some checks on _removeParams - it is very easy to make a mistake and not be able to remove the GC
    function proposeGlobalConstraint(Avatar _avatar, address _gc, bytes32 _params, bytes32 _removeParams) public returns(bytes32) {
        require(isRegistered(_avatar)); // Check org is registered to use this universal scheme.
        Parameters memory votingParams = parameters[getParametersFromController(_avatar)];

        IntVoteInterface intVote = votingParams.intVote;
        bytes32 proposalId = intVote.propose(2, votingParams.voteRegisterParams, _avatar, ExecutableInterface(this));

        GCProposal memory proposal = GCProposal({
            gc: _gc,
            params: _params,
            proposalType: 1,
            removeParams: _removeParams
        });

        if (organizations[_avatar].proposals[proposalId].proposalType != 0) {
            revert();
        }
        organizations[_avatar].proposals[proposalId] = proposal;
        LogNewGlobalConstraintsProposal(
            _avatar,
            proposalId,
            intVote,
            _gc,
            _params,
            _removeParams
        );
        intVote.ownerVote(proposalId, 1, msg.sender); // Automatically votes `yes` in the name of the opener.
        return proposalId;
    }

    // Proposing to remove a new GC:
    function proposeToRemoveGC(Avatar _avatar, address _gc) public returns(bytes32) {
        Organization storage org = organizations[_avatar];
        Parameters memory params = parameters[getParametersFromController(_avatar)];
        require(org.isRegistered); // Check org is registred to use this universal scheme.
        IntVoteInterface intVote = params.intVote;
        bytes32 proposalId = intVote.propose(2, org.removeParams[_gc], _avatar, ExecutableInterface(this));

        GCProposal memory proposal = GCProposal({
            gc: _gc,
            params: 0,
            proposalType: 2,
            removeParams: 0
        });

        if (organizations[_avatar].proposals[proposalId].proposalType != 0) {
            revert();
        }
        organizations[_avatar].proposals[proposalId] = proposal;
        LogRemoveGlobalConstraintsProposal(_avatar, proposalId, intVote, _gc);
        intVote.ownerVote(proposalId, 1, msg.sender); // Automatically votes `yes` in the name of the opener.
        return proposalId;
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _avatar address of the controller
    * @param _param a parameter of the voting result, 0 is no and 1 is yes.
    */
    function execute(bytes32 _proposalId, address _avatar, int _param) public returns(bool) {
        // Check the caller is indeed the voting machine:
        require(parameters[getParametersFromController(Avatar(_avatar))].intVote == msg.sender);

        // Check if vote was successful:
        if (_param != 1 ) {
            delete organizations[_avatar].proposals[_proposalId];
            LogProposalDeleted(_avatar, _proposalId);
            return true;
        }
        // Define controller and get the parmas:
        Controller controller = Controller(Avatar(_avatar).owner());
        GCProposal memory proposal = organizations[_avatar].proposals[_proposalId];

        // Adding a GC
        if (proposal.proposalType == 1) {
            if (!controller.addGlobalConstraint(proposal.gc, proposal.params)) {
                revert();
            }
        }

        // Removing a GC
        if (proposal.proposalType == 2) {
            if (!controller.removeGlobalConstraint(proposal.gc)) {
                revert();
            }
        }
        delete organizations[_avatar].proposals[_proposalId];
        LogProposalExecuted(_avatar, _proposalId);
        return true;
    }
}
