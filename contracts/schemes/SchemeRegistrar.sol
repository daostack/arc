pragma solidity ^0.4.24;

import "../VotingMachines/GenesisProtocolCallbacks.sol";
import "./ProxyScheme.sol";


/**
 * @title A registrar for Schemes for an organization
 * @dev The SchemeRegistrar is used for registering and unregistering schemes at an organization
 */
contract SchemeRegistrar is ProxyScheme, GenesisProtocolCallbacks, GenesisProtocolExecuteInterface {
    event NewSchemeProposal(
        bytes32 indexed _proposalId,
        address _scheme,
        bytes4 _permissions
    );
    event RemoveSchemeProposal(bytes32 indexed _proposalId, address _scheme);
    event ProposalExecuted(bytes32 indexed _proposalId, int _param);
    event ProposalDeleted(bytes32 indexed _proposalId);

    // a SchemeProposal is a  proposal to add or remove a scheme to/from the an organization
    struct SchemeProposal {
        address scheme; //
        uint proposalType; // 1: add a scheme, 2: remove a scheme.
        bytes4 permissions;
    }

    mapping(bytes32 => SchemeProposal) public organizationProposals;

    IntVoteInterface public intVote;
    bytes32 public voteRegisterParams;
    bytes32 public voteRemoveParams;

    function init(
        Avatar _avatar,
        IntVoteInterface _intVote,
        bytes32 _voteRegisterParams,
        bytes32 _voteRemoveParams
    ) external
    {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");

        avatar = _avatar;
        intVote = _intVote;
        voteRegisterParams = _voteRegisterParams;
        voteRemoveParams = _voteRemoveParams;
    }
    
    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _param a parameter of the voting result, 1 yes and 2 is no.
    */
    function executeProposal(bytes32 _proposalId, int _param) external onlyVotingMachine(_proposalId) returns(bool) {
        SchemeProposal memory proposal = organizationProposals[_proposalId];

        require(proposal.scheme != address(0), "Proposal doesn't exist");

        delete organizationProposals[_proposalId];

        emit ProposalDeleted(_proposalId);

        if (_param == 1) {
            // Define controller and get the params:
            ControllerInterface controller = ControllerInterface(Avatar(avatar).owner());

            // Add a scheme:
            if (proposal.proposalType == 1) {
                require(
                    controller.registerScheme(proposal.scheme, proposal.permissions),
                    "Failed to register scheme");
            }
            
            // Remove a scheme:
            if ( proposal.proposalType == 2 ) {
                require(controller.unregisterScheme(proposal.scheme), "Failed to unregister scheme");
            }
        }

        emit ProposalExecuted(_proposalId, _param);

        return true;
    }

    /**
    * @dev create a proposal to register a scheme
    * @param _scheme the address of the scheme to be registered
    * @param _permissions the permission of the scheme to be registered
    * @return a proposal Id
    * @dev NB: not only proposes the vote, but also votes for it
    */
    function proposeScheme(
        address _scheme,
        bytes4 _permissions
    )
    public
    returns(bytes32)
    {
        // propose
        require(_scheme != address(0), "Scheme address cannot be 0");

        bytes32 proposalId = intVote.propose(
            2,
            voteRegisterParams,
            msg.sender
        );

        SchemeProposal memory proposal = SchemeProposal({
            scheme: _scheme,
            proposalType: 1,
            permissions: _permissions
        });

        emit NewSchemeProposal(
            proposalId,
            _scheme,
            _permissions
        );

        organizationProposals[proposalId] = proposal;

        proposalsInfo[proposalId] = ProposalInfo({
            blockNumber: block.number,
            avatar: avatar,
            votingMachine: intVote
        });

        // vote for this proposal
        intVote.ownerVote(proposalId, 1, msg.sender); // Automatically votes `yes` in the name of the opener.
        
        return proposalId;
    }

    /**
    * @dev propose to remove a scheme for a controller
    * @param _scheme the address of the scheme we want to remove
    *
    * NB: not only registers the proposal, but also votes for it
    */
    function proposeToRemoveScheme(address _scheme) public returns(bytes32) {
        bytes32 proposalId = intVote.propose(2, voteRemoveParams, msg.sender);

        organizationProposals[proposalId].proposalType = 2;
        organizationProposals[proposalId].scheme = _scheme;

        emit RemoveSchemeProposal(proposalId, _scheme);

        proposalsInfo[proposalId] = ProposalInfo({
            blockNumber: block.number,
            avatar: avatar,
            votingMachine: intVote
        });

        // vote for this proposal
        intVote.ownerVote(proposalId, 1, msg.sender); // Automatically votes `yes` in the name of the opener.
        
        return proposalId;
    }
}
