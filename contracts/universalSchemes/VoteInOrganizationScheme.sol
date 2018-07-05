pragma solidity ^0.4.24;

import "../VotingMachines/IntVoteInterface.sol";
import "./UniversalScheme.sol";


/**
 * @title VoteInOrganizationScheme.
 * @dev A scheme to allow an organization to vote in a proposal.
 */
contract VoteInOrganizationScheme is UniversalScheme, ExecutableInterface {
    event NewVoteProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        IntVoteInterface _originalIntVote,
        bytes32 _originalProposalId,
        uint _originalNumOfChoices
    );
    event ProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId,int _param);
    event ProposalDeleted(address indexed _avatar, bytes32 indexed _proposalId);
    event VoteOnBehalf(bytes32[] _params);

    // Details of a voting proposal:
    struct VoteProposal {
        IntVoteInterface originalIntVote;
        bytes32 originalProposalId;
        uint originalNumOfChoices;
        bool exist;
    }

    // A mapping from the organization (Avatar) address to the saved data of the organization:
    mapping(address=>mapping(bytes32=>VoteProposal)) public organizationsProposals;


    struct Parameters {
        IntVoteInterface intVote;
        bytes32 voteParams;
    }

    // A mapping from hashes to parameters (use to store a particular configuration on the controller)
    mapping(bytes32=>Parameters) public parameters;

    /**
    * @dev Hash the parameters, save them if necessary, and return the hash value
    * @param _voteParams -  voting parameters
    * @param _intVote  - voting machine contract.
    * @return bytes32 -the parameters hash
    */
    function setParameters(
        bytes32 _voteParams,
        IntVoteInterface _intVote
    ) public returns(bytes32)
    {
        bytes32 paramsHash = getParametersHash(_voteParams, _intVote);
        parameters[paramsHash].voteParams = _voteParams;
        parameters[paramsHash].intVote = _intVote;
        return paramsHash;
    }

    /**
    * @dev Hash the parameters, and return the hash value
    * @param _voteParams -  voting parameters
    * @param _intVote  - voting machine contract.
    * @return bytes32 -the parameters hash
    */
    function getParametersHash(
        bytes32 _voteParams,
        IntVoteInterface _intVote
    ) public pure returns(bytes32)
    {
        return keccak256(abi.encodePacked(_voteParams, _intVote));
    }

    /**
    * @dev propose to vote in other organization
    *      The function trigger NewVoteProposal event
    * @param _avatar avatar of the organization
    * @param _originalIntVote the other organization voting machine
    * @param _originalProposalId the other organization proposal id
    * @return an id which represents the proposal
    */
    function proposeVote(Avatar _avatar, IntVoteInterface _originalIntVote, bytes32 _originalProposalId)
    public
    returns(bytes32)
    {
        uint originalNumOfChoices = _originalIntVote.getNumberOfChoices(_originalProposalId);
        Parameters memory params = parameters[getParametersFromController(_avatar)];
        IntVoteInterface intVote = params.intVote;

        uint proposalNumberOfChoices = originalNumOfChoices;
        if (intVote.isAbstainAllow()) {
            //The voting choices can be in the range of 0 - originalNumOfChoices+1 .
            //vote 0 - for not to vote in the other organization.
            //vote originalNumOfChoices+1 to vote 0 in the other organization.
            proposalNumberOfChoices += 1;
        }
        bytes32 proposalId = intVote.propose(proposalNumberOfChoices, params.voteParams, _avatar, ExecutableInterface(this),msg.sender);

        organizationsProposals[_avatar][proposalId] = VoteProposal({
            originalIntVote: _originalIntVote,
            originalProposalId: _originalProposalId,
            originalNumOfChoices: originalNumOfChoices,
            exist: true
        });
        emit NewVoteProposal(
            _avatar,
            proposalId,
            params.intVote,
            _originalIntVote,
            _originalProposalId,
            originalNumOfChoices
        );
        return proposalId;
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    *      This function will trigger ProposalDeleted and ProposalExecuted events
    * @param _proposalId the ID of the voting in the voting machine
    * @param _avatar address of the organization's avatar
    * @param _param a parameter of the voting result 0 to numOfChoices .
    * @return bool which indicate success.
    */
    function execute(bytes32 _proposalId, address _avatar, int _param) public returns(bool) {
        // Check the caller is indeed the voting machine:
        require(parameters[getParametersFromController(Avatar(_avatar))].intVote == msg.sender);

        // Save proposal to memory and delete from storage:
        VoteProposal memory proposal = organizationsProposals[_avatar][_proposalId];
        require(proposal.exist);
        delete organizationsProposals[_avatar][_proposalId];
        emit ProposalDeleted(_avatar, _proposalId);
        bool retVal = true;
        // If no decision do nothing:
        if (_param != 0) {
        // Define controller and get the params:
            int param = _param;
            if (param > int(proposal.originalNumOfChoices)) {
                param = 0;
            }

            ControllerInterface controller = ControllerInterface(Avatar(_avatar).owner());
            if (controller.genericCall(
                     address(proposal.originalIntVote),
                     abi.encodeWithSignature("vote(bytes32,uint256)",
                     proposal.originalProposalId,
                     uint(param)),
                     _avatar) == bytes32(0)) {
                retVal = false;
            }
          }
        emit ProposalExecuted(_avatar, _proposalId,_param);
        return retVal;
    }
}
