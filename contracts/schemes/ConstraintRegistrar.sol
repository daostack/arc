pragma solidity ^0.4.24;

import "../VotingMachines/GenesisProtocolCallbacks.sol";
import "./ProxyScheme.sol";


/**
 * @title A scheme to manage constraint for organizations
 * @dev The scheme is used to register or remove new constraints
 */
contract ConstraintRegistrar is ProxyScheme, GenesisProtocolCallbacks, GenesisProtocolExecuteInterface {
    event NewConstraintsProposal(bytes32 indexed _proposalId, address _constraint, bytes32 _voteToRemoveParams);
    event RemoveConstraintsProposal(bytes32 indexed _proposalId, address _constraint);
    event ProposalExecuted(bytes32 indexed _proposalId, int _param);
    event ProposalDeleted(bytes32 indexed _proposalId);

    // The struct that holds the information of a constraint proposed to be added or removed.
    struct ConstraintProposal {
        address constraint; // The address of the constraint contract.
        uint proposalType; // 1: add a constraint, 2: remove a constraint.
        bytes32 voteToRemoveParams; // Voting parameters for removing this constraint.
    }

    // ConstraintProposal by proposalId
    mapping(bytes32 => ConstraintProposal) public organizationProposals;

    mapping(address => bytes32) public voteToRemoveParams;
    
    IntVoteInterface public intVote;
    bytes32 public voteRegisterParams;
    
    function init(
        Avatar _avatar,
        IntVoteInterface _intVote,
        bytes32 _voteRegisterParams
    ) external
    {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");

        avatar = _avatar;
        intVote = _intVote;
        voteRegisterParams = _voteRegisterParams;
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _param a parameter of the voting result, 1 yes and 2 is no.
    * @return bool which represents a successful of the function.
    */
    function executeProposal(bytes32 _proposalId, int _param) external onlyVotingMachine(_proposalId) returns(bool) {
        bool retVal = true;
        
        // Check if vote was successful:
        ConstraintProposal memory proposal = organizationProposals[_proposalId];
        
        require(proposal.constraint != address(0), "Proposal doesn't exists");
        
        delete organizationProposals[_proposalId];
        
        emit ProposalDeleted(_proposalId);

        if (_param == 1) {
            // Define controller and get the params:
            ControllerInterface controller = ControllerInterface(Avatar(avatar).owner());

            // Adding a Constraint
            if (proposal.proposalType == 1) {
                retVal = controller.addConstraint(proposal.constraint);
                voteToRemoveParams[proposal.constraint] = proposal.voteToRemoveParams;
            }
            
            // Removing a Constraint
            if (proposal.proposalType == 2) {
                retVal = controller.removeConstraint(proposal.constraint);
            }
        }

        emit ProposalExecuted(_proposalId, _param);

        return retVal;
    }

    /**
    * @dev propose to add a new constraint:
    * @param _constraint the address of the constraint that is being proposed
    * @param _voteToRemoveParams the conditions (on the voting machine) for removing this constraint
    * @return bytes32 - the proposal id
    */
    // TODO: do some checks on _voteToRemoveParams - it is very easy to make a mistake and not be able to remove the Constraint
    function proposeConstraint(address _constraint, bytes32 _voteToRemoveParams) public returns(bytes32) {
        bytes32 proposalId = intVote.propose(2, voteRegisterParams, msg.sender);

        ConstraintProposal memory proposal = ConstraintProposal({
            constraint: _constraint,
            proposalType: 1,
            voteToRemoveParams: _voteToRemoveParams
        });

        organizationProposals[proposalId] = proposal;
        emit NewConstraintsProposal(
            proposalId,
            _constraint,
            _voteToRemoveParams
        );

        proposalsInfo[proposalId] = ProposalInfo({
            blockNumber: block.number,
            avatar: avatar,
            votingMachine: intVote
        });
        
        intVote.ownerVote(proposalId, 1, msg.sender); // Automatically votes `yes` in the name of the opener.
        
        return proposalId;
    }

    /**
    * @dev propose to remove a constraint:
    * @param _constraint the address of the constraint that is being proposed
    * @return bytes32 -the proposal id
    */
    function proposeToRemoveConstraint(address _constraint) public returns(bytes32) {
        ControllerInterface controller = ControllerInterface(Avatar(avatar).owner());

        require(controller.isConstraintRegistered(_constraint), "Constraint is not registered in organization");

        bytes32 proposalId = intVote.propose(2, voteToRemoveParams[_constraint], msg.sender);

        ConstraintProposal memory proposal = ConstraintProposal({
            constraint: _constraint,
            proposalType: 2,
            voteToRemoveParams: 0
        });

        organizationProposals[proposalId] = proposal;
        
        emit RemoveConstraintsProposal(proposalId, _constraint);
        
        proposalsInfo[proposalId] = ProposalInfo({
            blockNumber: block.number,
            avatar: avatar,
            votingMachine: intVote
        });

        intVote.ownerVote(proposalId, 1, msg.sender); // Automatically votes `yes` in the name of the opener.
        
        return proposalId;
    }
}
