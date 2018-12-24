pragma solidity ^0.4.25;

import "@daostack/infra/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "./UniversalScheme.sol";
import "../votingMachines/VotingMachineCallbacks.sol";



/**
 * @title A scheme to manage global constraint for organizations
 * @dev The scheme is used to register or remove new global constraints
 */
contract GlobalConstraintRegistrar is UniversalScheme,VotingMachineCallbacks,ProposalExecuteInterface {
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
    event ProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId,int _param);
    event ProposalDeleted(address indexed _avatar, bytes32 indexed _proposalId);

    // The struct that holds the information of a global constraint proposed to be added or removed.
    struct GCProposal {
        address gc; // The address of the global constraint contract.
        bytes32 params; // Parameters for global constraint.
        uint256 proposalType; // 1: add a GC, 2: remove a GC.
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
    function executeProposal(bytes32 _proposalId,int _param) external onlyVotingMachine(_proposalId) returns(bool) {
        address avatar = proposalsInfo[_proposalId].avatar;
        bool retVal = true;
        // Check if vote was successful:
        GCProposal memory proposal = organizationsProposals[avatar][_proposalId];
        require(proposal.gc != address(0));
        delete organizationsProposals[avatar][_proposalId];
        emit ProposalDeleted(avatar,_proposalId);

        if (_param == 1 ) {

        // Define controller and get the params:
            ControllerInterface controller = ControllerInterface(Avatar(avatar).owner());

        // Adding a GC
            if (proposal.proposalType == 1) {
                retVal = controller.addGlobalConstraint(proposal.gc, proposal.params,avatar);
                voteToRemoveParams[avatar][proposal.gc] = proposal.voteToRemoveParams;
              }
        // Removing a GC
            if (proposal.proposalType == 2) {
                retVal = controller.removeGlobalConstraint(proposal.gc,avatar);
              }
        }
        emit ProposalExecuted(avatar, _proposalId,_param);
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
    * @return bytes32 -the proposal id
    */
    // TODO: do some checks on _voteToRemoveParams - it is very easy to make a mistake and not be able to remove the GC
    function proposeGlobalConstraint(Avatar _avatar, address _gc, bytes32 _params, bytes32 _voteToRemoveParams)
    public
    returns(bytes32)
    {
        Parameters memory votingParams = parameters[getParametersFromController(_avatar)];

        IntVoteInterface intVote = votingParams.intVote;
        bytes32 proposalId = intVote.propose(2, votingParams.voteRegisterParams,msg.sender,_avatar);

        GCProposal memory proposal = GCProposal({
            gc: _gc,
            params: _params,
            proposalType: 1,
            voteToRemoveParams: _voteToRemoveParams
        });

        organizationsProposals[_avatar][proposalId] = proposal;
        emit NewGlobalConstraintsProposal(
            _avatar,
            proposalId,
            intVote,
            _gc,
            _params,
            _voteToRemoveParams
        );
        proposalsInfo[proposalId] = ProposalInfo(
            {blockNumber:block.number,
            avatar:_avatar,
            votingMachine:intVote});
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
        Controller controller = Controller(Avatar(_avatar).owner());
        require(controller.isGlobalConstraintRegistered(_gc,address(_avatar)));
        Parameters memory params = parameters[getParametersFromController(_avatar)];
        IntVoteInterface intVote = params.intVote;
        bytes32 proposalId = intVote.propose(2, voteToRemoveParams[_avatar][_gc],msg.sender,_avatar);

        GCProposal memory proposal = GCProposal({
            gc: _gc,
            params: 0,
            proposalType: 2,
            voteToRemoveParams: 0
        });

        organizationsProposals[_avatar][proposalId] = proposal;
        emit RemoveGlobalConstraintsProposal(_avatar, proposalId, intVote, _gc);
        proposalsInfo[proposalId] = ProposalInfo(
            {blockNumber:block.number,
            avatar:_avatar,
            votingMachine:intVote});
        intVote.ownerVote(proposalId, 1, msg.sender); // Automatically votes `yes` in the name of the opener.
        return proposalId;
    }
}
