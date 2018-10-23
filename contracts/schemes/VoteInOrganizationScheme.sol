pragma solidity ^0.4.24;

import "../controller/ControllerInterface.sol";
import "../controller/Avatar.sol";
import "../VotingMachines/GenesisProtocolCallbacks.sol";


/**
 * @title VoteInOrganizationScheme.
 * @dev A scheme to allow an organization to vote in a proposal.
 */
contract VoteInOrganizationScheme is GenesisProtocolCallbacks, GenesisProtocolExecuteInterface {
    
    event NewVoteProposal(
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        IntVoteInterface _originalIntVote,
        bytes32 _originalProposalId,
        uint _originalNumOfChoices
    );
    event ProposalExecuted(bytes32 indexed _proposalId, int _param);
    event ProposalDeleted(bytes32 indexed _proposalId);
    event VoteOnBehalf(bytes32[] _params);

    // Details of a voting proposal:
    struct VoteProposal {
        IntVoteInterface originalIntVote;
        bytes32 originalProposalId;
        uint originalNumOfChoices;
    }

    mapping(bytes32 => VoteProposal) public organizationProposals;
    
    IntVoteInterface public intVote;
    bytes32 public voteParams;
    Avatar public avatar;

    constructor () public {
        avatar = Avatar(0x000000000000000000000000000000000000dead);
    }

    function init(
        Avatar _avatar,
        IntVoteInterface _intVote,
        bytes32 _voteParams
    ) external
    {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");

        avatar = _avatar;
        intVote = _intVote;
        voteParams = _voteParams;
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _param a parameter of the voting result, 1 yes and 2 is no.
    * @return bool which represents a successful of the function
    */
    function executeProposal(bytes32 _proposalId, int _param) external onlyVotingMachine(_proposalId) returns(bool) {
        // Save proposal to memory and delete from storage:
        VoteProposal memory proposal = organizationProposals[_proposalId];
        
        require(address(proposal.originalIntVote) != address(0), "Proposal doesn't exist");
        
        delete organizationProposals[_proposalId];

        emit ProposalDeleted(_proposalId);

        bool retVal = true;
        // If no decision do nothing:
        if (_param != 0) {
        // Define controller and get the params:
            int param = _param;
            if (param > int(proposal.originalNumOfChoices)) {
                param = 0;
            }

            ControllerInterface controller = ControllerInterface(Avatar(avatar).owner());

            if (controller.genericCall(
                    address(proposal.originalIntVote),
                    abi.encodeWithSignature(
                        "vote(bytes32,uint256,address)",
                        proposal.originalProposalId,
                        uint(param),
                        address(this)
                    )) == bytes32(0)) {
                retVal = false;
            }
          }
        
        emit ProposalExecuted(_proposalId, _param);

        return retVal;
    }

    /**
    * @dev propose to vote in other organization
    *      The function trigger NewVoteProposal event
    * @param _originalIntVote the other organization voting machine
    * @param _originalProposalId the other organization proposal id
    * @return an id which represents the proposal
    */
    function proposeVote(
        IntVoteInterface _originalIntVote,
        bytes32 _originalProposalId
    )
    public
    returns(bytes32)
    {
        require(address(_originalIntVote) != address(0), "Original Int Vote address can't be empty");
        uint originalNumOfChoices = _originalIntVote.getNumberOfChoices(_originalProposalId);

        uint proposalNumberOfChoices = originalNumOfChoices;
        
        if (intVote.isAbstainAllow()) {
            // The voting choices can be in the range of 0 - originalNumOfChoices + 1.
            // vote 0 - for not to vote in the other organization.
            // vote originalNumOfChoices + 1 to vote 0 in the other organization.
            proposalNumberOfChoices += 1;
        }

        bytes32 proposalId = intVote.propose(proposalNumberOfChoices, voteParams, msg.sender);

        organizationProposals[proposalId] = VoteProposal({
            originalIntVote: _originalIntVote,
            originalProposalId: _originalProposalId,
            originalNumOfChoices: originalNumOfChoices
        });

        emit NewVoteProposal(
            proposalId,
            intVote,
            _originalIntVote,
            _originalProposalId,
            originalNumOfChoices
        );

        proposalsInfo[proposalId] = ProposalInfo(
            {
            blockNumber: block.number,
            avatar: avatar,
            votingMachine: intVote
            }
        );

        return proposalId;
    }
}
