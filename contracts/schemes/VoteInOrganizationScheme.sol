pragma solidity ^0.5.17;

import "../votingMachines/VotingMachineCallbacks.sol";


/**
 * @title VoteInOrganizationScheme.
 * @dev A scheme to allow an organization to vote in a proposal.
 */
contract VoteInOrganizationScheme is VotingMachineCallbacks, ProposalExecuteInterface {
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

    mapping(bytes32=>VoteProposal) public organizationProposals;

    /**
     * @dev initialize
     * @param _avatar the avatar this scheme referring to.
     * @param _votingParams genesisProtocol parameters
     * @param _voteOnBehalf  parameter
     * @param _daoFactory  DAOFactory instance to instance a votingMachine.
     * @param _stakingToken (for GenesisProtocol)
     * @param _packageVersion packageVersion to instance the votingMachine from.
     * @param _votingMachineName the votingMachine contract name.
     */
    function initialize(
        Avatar _avatar,
        uint256[11] calldata _votingParams,
        address _voteOnBehalf,
        DAOFactory _daoFactory,
        address _stakingToken,
        uint64[3] calldata _packageVersion,
        string calldata _votingMachineName
    )
    external
    {
        super._initializeGovernance(
            _avatar,
            _votingParams,
            _voteOnBehalf,
            _daoFactory,
            _stakingToken,
            address(this),
            address(this),
            _packageVersion,
            _votingMachineName);
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _decision the voting result, 1 yes and 2 is no.
    * @return bool which represents a successful of the function
    */
    function executeProposal(bytes32 _proposalId, int256 _decision)
    external
    onlyVotingMachine(_proposalId)
    returns(bool) {
        // Save proposal to memory and delete from storage:
        VoteProposal memory proposal = organizationProposals[_proposalId];
        require(proposal.exist);
        delete organizationProposals[_proposalId];
        emit ProposalDeleted(address(avatar), _proposalId);
        bytes memory callReturnValue;
        bool success;
        // If no decision do nothing:
        if (_decision == 1) {

            Controller controller = Controller(avatar.owner());
            (success, callReturnValue) = controller.genericCall(
            address(proposal.originalIntVote),
            abi.encodeWithSignature("vote(bytes32,uint256,uint256,address)",
            proposal.originalProposalId,
            proposal.vote,
            0,
            address(this)),
            0
            );
            require(success);
        }
        emit ProposalExecuted(address(avatar), _proposalId, _decision, callReturnValue);
        return true;
    }

    /**
    * @dev propose to vote in other organization
    *      The function trigger NewVoteProposal event
    * @param _originalIntVote the other organization voting machine
    * @param _originalProposalId the other organization proposal id
    * @param _vote - which value to vote in the destination organization
    * @param _descriptionHash proposal description hash
    * @return an id which represents the proposal
    */
    function proposeVote(
    IntVoteInterface _originalIntVote,
    bytes32 _originalProposalId,
    uint256 _vote,
    string memory _descriptionHash)
    public
    returns(bytes32 proposalId)
    {
        (uint256 minVote, uint256 maxVote) = _originalIntVote.getAllowedRangeOfChoices();
        require(_vote <= maxVote && _vote >= minVote, "vote should be in the allowed range");
        require(_vote <= _originalIntVote.getNumberOfChoices(_originalProposalId),
        "vote should be <= original proposal number of choices");

        proposalId = votingMachine.propose(2, msg.sender);

        organizationProposals[proposalId] = VoteProposal({
            originalIntVote: _originalIntVote,
            originalProposalId: _originalProposalId,
            vote:_vote,
            exist: true
        });
        emit NewVoteProposal(
            address(avatar),
            proposalId,
            address(votingMachine),
            _originalIntVote,
            _originalProposalId,
            _vote,
            _descriptionHash
        );
        proposalsBlockNumber[proposalId] = block.number;
    }
}
