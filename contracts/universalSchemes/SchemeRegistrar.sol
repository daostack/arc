pragma solidity ^0.4.24;

import "@daostack/infra/contracts/VotingMachines/IntVoteInterface.sol";
import "@daostack/infra/contracts/VotingMachines/GenesisProtocolCallbacksInterface.sol";
import "./UniversalScheme.sol";
import "../VotingMachines/GenesisProtocolCallbacks.sol";


/**
 * @title A registrar for Schemes for organizations
 * @dev The SchemeRegistrar is used for registering and unregistering schemes at organizations
 */

contract SchemeRegistrar is UniversalScheme,GenesisProtocolCallbacks,GenesisProtocolExecuteInterface {
    event NewSchemeProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        address _scheme,
        bytes32 _parametersHash,
        bytes4 _permissions
    );
    event RemoveSchemeProposal(address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        address _scheme
    );
    event ProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId,int _param);
    event ProposalDeleted(address indexed _avatar, bytes32 indexed _proposalId);

    // a SchemeProposal is a  proposal to add or remove a scheme to/from the an organization
    struct SchemeProposal {
        address scheme; //
        bytes32 parametersHash;
        uint proposalType; // 1: add a scheme, 2: remove a scheme.
        bytes4 permissions;
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
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _param a parameter of the voting result, 1 yes and 2 is no.
    */
    function executeProposal(bytes32 _proposalId,int _param) external onlyVotingMachine(_proposalId) returns(bool) {
        address avatar = proposalsInfo[_proposalId].avatar;
        SchemeProposal memory proposal = organizationsProposals[avatar][_proposalId];
        require(proposal.scheme != address(0));
        delete organizationsProposals[avatar][_proposalId];
        emit ProposalDeleted(avatar,_proposalId);
        if (_param == 1) {

          // Define controller and get the params:
            ControllerInterface controller = ControllerInterface(Avatar(avatar).owner());

          // Add a scheme:
            if (proposal.proposalType == 1) {
                require(controller.registerScheme(proposal.scheme, proposal.parametersHash, proposal.permissions,avatar));
            }
          // Remove a scheme:
            if ( proposal.proposalType == 2 ) {
                require(controller.unregisterScheme(proposal.scheme,avatar));
            }
          }
        emit ProposalExecuted(avatar, _proposalId,_param);
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
        return keccak256(abi.encodePacked(_voteRegisterParams, _voteRemoveParams, _intVote));
    }

    /**
    * @dev create a proposal to register a scheme
    * @param _avatar the address of the organization the scheme will be registered for
    * @param _scheme the address of the scheme to be registered
    * @param _parametersHash a hash of the configuration of the _scheme
    * @param _permissions the permission of the scheme to be registered
    * @return a proposal Id
    * @dev NB: not only proposes the vote, but also votes for it
    */
    function proposeScheme(
        Avatar _avatar,
        address _scheme,
        bytes32 _parametersHash,
        bytes4 _permissions
    )
    public
    returns(bytes32)
    {
        // propose
        require(_scheme != address(0));
        Parameters memory controllerParams = parameters[getParametersFromController(_avatar)];

        bytes32 proposalId = controllerParams.intVote.propose(
            2,
            controllerParams.voteRegisterParams,
            msg.sender
        );

        SchemeProposal memory proposal = SchemeProposal({
            scheme: _scheme,
            parametersHash: _parametersHash,
            proposalType: 1,
            permissions: _permissions
        });
        emit NewSchemeProposal(
            _avatar,
            proposalId,
            controllerParams.intVote,
            _scheme, _parametersHash,
            _permissions
        );
        organizationsProposals[_avatar][proposalId] = proposal;
        proposalsInfo[proposalId] = ProposalInfo(
            {blockNumber:block.number,
            avatar:_avatar,
            votingMachine:controllerParams.intVote});

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
        bytes32 proposalId = intVote.propose(2, params.voteRemoveParams,msg.sender);

        organizationsProposals[_avatar][proposalId].proposalType = 2;
        organizationsProposals[_avatar][proposalId].scheme = _scheme;
        emit RemoveSchemeProposal(_avatar, proposalId, intVote, _scheme);
        proposalsInfo[proposalId] = ProposalInfo(
            {blockNumber:block.number,
            avatar:_avatar,
            votingMachine:params.intVote});
        // vote for this proposal
        intVote.ownerVote(proposalId, 1, msg.sender); // Automatically votes `yes` in the name of the opener.
        return proposalId;
    }
}
