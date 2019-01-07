pragma solidity ^0.5.2;

import "@daostack/infra/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "./UniversalScheme.sol";
import "../votingMachines/VotingMachineCallbacks.sol";


/**
 * @title VoteInOrganizationScheme.
 * @dev A scheme to allow an organization to vote in a proposal.
 */
contract VoteInOrganizationScheme is UniversalScheme, VotingMachineCallbacks, ProposalExecuteInterface {
    event NewVoteProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        IntVoteInterface _originalIntVote,
        bytes32 _originalProposalId,
        uint256 _vote,
        string _descriptionHash
    );

    event ProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId, int256 _param, bytes _callReturnValue);
    event ProposalDeleted(address indexed _avatar, bytes32 indexed _proposalId);

    // Details of a voting proposal:
    struct VoteProposal {
        IntVoteInterface originalIntVote;
        bytes32 originalProposalId;
        uint256 vote;
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
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _param a parameter of the voting result, 1 yes and 2 is no.
    * @return bool which represents a successful of the function
    */
    function executeProposal(bytes32 _proposalId, int256 _param) external onlyVotingMachine(_proposalId) returns(bool) {
        Avatar avatar = proposalsInfo[_proposalId].avatar;
        // Save proposal to memory and delete from storage:
        VoteProposal memory proposal = organizationsProposals[address(avatar)][_proposalId];
        require(proposal.exist);
        delete organizationsProposals[address(avatar)][_proposalId];
        emit ProposalDeleted(address(avatar), _proposalId);
        bytes memory callReturnValue;
        bool success;
        // If no decision do nothing:
        if (_param == 1) {

            ControllerInterface controller = ControllerInterface(avatar.owner());
            (success, callReturnValue) = controller.genericCall(
            address(proposal.originalIntVote),
            abi.encodeWithSignature("vote(bytes32,uint256,uint256,address)",
            proposal.originalProposalId,
            proposal.vote,
            0,
            address(this)),
            avatar
            );
            require(success);
        }
        emit ProposalExecuted(address(avatar), _proposalId, _param, callReturnValue);
        return true;
    }

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
    * @param _vote - which value to vote in the destination organization
    * @param _descriptionHash proposal description hash
    * @return an id which represents the proposal
    */
    function proposeVote(
    Avatar _avatar,
    IntVoteInterface _originalIntVote,
    bytes32 _originalProposalId,
    uint256 _vote,
    string memory _descriptionHash)
    public
    returns(bytes32)
    {
        Parameters memory params = parameters[getParametersFromController(_avatar)];
        IntVoteInterface intVote = params.intVote;
        (uint256 minVote, uint256 maxVote) = _originalIntVote.getAllowedRangeOfChoices();
        require(_vote <= maxVote && _vote >= minVote, "vote should be in the allowed range");
        require(_vote <= _originalIntVote.getNumberOfChoices(_originalProposalId),
        "vote should be <= original proposal number of choices");

        bytes32 proposalId = intVote.propose(2, params.voteParams, msg.sender, address(_avatar));

        organizationsProposals[address(_avatar)][proposalId] = VoteProposal({
            originalIntVote: _originalIntVote,
            originalProposalId: _originalProposalId,
            vote:_vote,
            exist: true
        });
        emit NewVoteProposal(
            address(_avatar),
            proposalId,
            address(params.intVote),
            _originalIntVote,
            _originalProposalId,
            _vote,
            _descriptionHash
        );
        proposalsInfo[proposalId] = ProposalInfo({
            blockNumber:block.number,
            avatar:_avatar,
            votingMachine:address(intVote)
        });
        return proposalId;
    }
}
