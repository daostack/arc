pragma solidity ^0.4.19;

import "../VotingMachines/IntVoteInterface.sol";
import "./UniversalScheme.sol";


/**
 * @title A registrar for Schemes for organizations
 * @dev The SchemeRegistrar is used for registering and unregistering schemes at organizations
 */

contract SchemeRegistrar is UniversalScheme {
    event NewSchemeProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        address _scheme,
        bytes32 _parametersHash,
        bool _isRegistering
    );
    event RemoveSchemeProposal(address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        address _scheme
    );
    event ProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId);
    event ProposalDeleted(address indexed _avatar, bytes32 indexed _proposalId);

    // a SchemeProposal is a  proposal to add or remove a scheme to/from the an organization
    struct SchemeProposal {
        address scheme; //
        bytes32 parametersHash;
        uint proposalType; // 1: add a scheme, 2: remove a scheme.
        bool isRegistering;
    }

    // A mapping from the organization (Avatar) address to the saved data of the organization:
    mapping(address=>mapping(bytes32=>SchemeProposal)) public organizationsProposals;

    // A mapping from hashes to parameters (use to store a particular configuration on the controller)
    struct Parameters {
        bytes32 voteRegisterParams;
        bytes32 voteRemoveParams;
        IntVoteInterface intVote;
    }
    mapping(bytes32=>Parameters) public parameters;

    /**
    * @dev The Constructor
    */
    function SchemeRegistrar() public {}

    /**
    * @dev execute a  proposal
    * This method can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the proposal in the voting machine
    * @param _avatar address of the controller
    * @param _param identifies the action to be taken
    */
    // TODO: this call can be simplified if we save the _avatar together with the proposal
    function execute(bytes32 _proposalId, address _avatar, int _param) external returns(bool) {
          // Check the caller is indeed the voting machine:
        require(parameters[getParametersFromController(Avatar(_avatar))].intVote == msg.sender);

        SchemeProposal memory proposal = organizationsProposals[_avatar][_proposalId];
        delete organizationsProposals[_avatar][_proposalId];
        if (_param == 1) {

          // Define controller and get the params:
            ControllerInterface controller = ControllerInterface(Avatar(_avatar).owner());

          // Add a scheme:
            if (proposal.proposalType == 1) {
                if (proposal.isRegistering == false) {
                    require(controller.registerScheme(proposal.scheme, proposal.parametersHash, bytes4(1),_avatar));
                    } else {
                    require(controller.registerScheme(proposal.scheme, proposal.parametersHash, bytes4(3),_avatar));
                }
            }
          // Remove a scheme:
            if ( proposal.proposalType == 2 ) {
                require(controller.unregisterScheme(proposal.scheme,_avatar));
            }
          }
        ProposalExecuted(_avatar, _proposalId);
        return true;
    }

    /**
    * @dev hash the parameters, save them if necessary, and return the hash value
    */
    function setParameters(
        bytes32 _voteRegisterParams,
        bytes32 _voteRemoveParams,
        IntVoteInterface _intVote
    ) public returns(bytes32)
    {
        bytes32 paramsHash = getParametersHash(_voteRegisterParams, _voteRemoveParams, _intVote);
        parameters[paramsHash].voteRegisterParams = _voteRegisterParams;
        parameters[paramsHash].voteRemoveParams = _voteRemoveParams;
        parameters[paramsHash].intVote = _intVote;
        return paramsHash;
    }

    function getParametersHash(
        bytes32 _voteRegisterParams,
        bytes32 _voteRemoveParams,
        IntVoteInterface _intVote
    ) public pure returns(bytes32)
    {
        return keccak256(_voteRegisterParams, _voteRemoveParams, _intVote);
    }

    /**
    * @dev create a proposal to register a scheme
    * @param _avatar the address of the organization the scheme will be registered for
    * @param _scheme the address of the scheme to be registered
    * @param _parametersHash a hash of the configuration of the _scheme
    * @param _isRegistering a boolean represent if the scheme is a registering scheme
    *      that can register other schemes
    * @return a proposal Id
    * @dev NB: not only proposes the vote, but also votes for it
    */
    function proposeScheme(
        Avatar _avatar,
        address _scheme,
        bytes32 _parametersHash,
        bool _isRegistering
    )
    public
    returns(bytes32)
    {
        // propose
        Parameters memory controllerParams = parameters[getParametersFromController(_avatar)];

        bytes32 proposalId = controllerParams.intVote.propose(2, controllerParams.voteRegisterParams, _avatar, ExecutableInterface(this),msg.sender);

        SchemeProposal memory proposal = SchemeProposal({
            scheme: _scheme,
            parametersHash: _parametersHash,
            proposalType: 1,
            isRegistering: _isRegistering
        });
        NewSchemeProposal(
            _avatar,
            proposalId,
            controllerParams.intVote,
            _scheme, _parametersHash,
            _isRegistering
        );
        organizationsProposals[_avatar][proposalId] = proposal;

        // vote for this proposal
        controllerParams.intVote.ownerVote(proposalId, 1, msg.sender); // Automatically votes `yes` in the name of the opener.
        return proposalId;
    }

    /**
    * @dev propose to remove a scheme for a controller
    * @param _avatar the address of the controller from which we want to remove a scheme
    * @param _scheme the address of the scheme we want to remove
    *
    * NB: not only registers the proposal, but also votes for it
    */
    function proposeToRemoveScheme(Avatar _avatar, address _scheme)
    public
    returns(bytes32)
    {
        bytes32 paramsHash = getParametersFromController(_avatar);
        Parameters memory params = parameters[paramsHash];

        IntVoteInterface intVote = params.intVote;
        bytes32 proposalId = intVote.propose(2, params.voteRemoveParams, _avatar, ExecutableInterface(this),msg.sender);

        organizationsProposals[_avatar][proposalId].proposalType = 2;
        organizationsProposals[_avatar][proposalId].scheme = _scheme;
        RemoveSchemeProposal(_avatar, proposalId, intVote, _scheme);
        // vote for this proposal
        intVote.ownerVote(proposalId, 1, msg.sender); // Automatically votes `yes` in the name of the opener.
        return proposalId;
    }
}
