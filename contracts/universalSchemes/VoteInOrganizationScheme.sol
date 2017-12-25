pragma solidity ^0.4.18;

import "../VotingMachines/IntVoteInterface.sol";
import "./UniversalScheme.sol";


/**
 * @title VoteInOrganizationScheme.
 * @dev A scheme to allow an organization to vote in a proposal.
 */

// ToDo: Documentation and tests!

contract VoteInOrganizationScheme is UniversalScheme, ExecutableInterface, ActionInterface {
    event LogNewVoteProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        IntVoteInterface _originalIntVote,
        bytes32 _originalProposalId,
        uint _originalNumOfChoices
    );
    event LogProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId);
    event LogProposalDeleted(address indexed _avatar, bytes32 indexed _proposalId);

    // Details of a voting proposal:
    struct VoteProposal {
        IntVoteInterface originalIntVote;
        bytes32 originalProposalId;
        uint originalNumOfChoices;
    }

    // A mapping from thr organization (Avatar) address to the saved data of the organization:
    mapping(address=>mapping(bytes32=>VoteProposal)) public organizationsData;

    // A mapping from hashes to parameters (use to store a particular configuration on the controller)
    struct Parameters {
        IntVoteInterface intVote;
        bytes32 voteParams;
    }

    mapping(bytes32=>Parameters) parameters;

    /**
    * @dev the constructor takes a token address, fee and beneficiary
    */
    function VoteInOrganizationScheme(StandardToken _nativeToken, uint _fee, address _beneficiary) public {
        updateParameters(_nativeToken, _fee, _beneficiary, bytes32(0));
    }

    /**
    * @dev hash the parameters, save them if necessary, and return the hash value
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
    * @dev return a hash of the given parameters
    */
    function getParametersHash(
        bytes32 _voteParams,
        IntVoteInterface _intVote
    ) public pure returns(bytes32)
    {
        bytes32 paramsHash = (keccak256(_voteParams, _intVote));
        return paramsHash;
    }

    function proposeVote(Avatar _avatar, IntVoteInterface _originalIntVote, bytes32 _originalProposalId)
    public
    onlyRegisteredOrganization(_avatar)
    returns(bytes32)
    {
        uint numOfChoices = _originalIntVote.getNumberOfChoices(_originalProposalId);
        Parameters memory params = parameters[getParametersFromController(_avatar)];
        IntVoteInterface intVote = params.intVote;
        bytes32 proposalId = intVote.propose(numOfChoices+1, params.voteParams, _avatar, ExecutableInterface(this));
        if (organizationsData[_avatar][proposalId].originalNumOfChoices != 0) {
            revert();
        }
        organizationsData[_avatar][proposalId] = VoteProposal({
            originalIntVote: _originalIntVote,
            originalProposalId: _originalProposalId,
            originalNumOfChoices: numOfChoices
        });
        LogNewVoteProposal(
            _avatar,
            proposalId,
            params.intVote,
            _originalIntVote,
            _originalProposalId,
            numOfChoices
        );
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

        // Save proposal to memory and delete from storage:
        VoteProposal memory proposal = organizationsData[_avatar][_proposalId];
        delete organizationsData[_avatar][_proposalId];

        // If no decision do nothing:
        if (_param == 0) {
            LogProposalDeleted(_avatar, _proposalId);
            return true;
        }

        // Define controller and get the parmas:
        Controller controller = Controller(Avatar(_avatar).owner());
        if (_param > int(proposal.originalNumOfChoices)) {
            _param = 0;
        }
        bytes32[] memory tmp = new bytes32[](3);
        tmp[0] = bytes32(address(proposal.originalIntVote));
        tmp[2] = proposal.originalProposalId;
        tmp[3] = bytes32(_param);
        controller.genericAction(tmp);
        LogProposalExecuted(_avatar, _proposalId);
        return true;
    }

    function action(bytes32[] _params) public returns(bool) {
        IntVoteInterface intVote = IntVoteInterface(address(_params[0]));
        bytes32 proposalId = _params[1];
        uint vote = uint(_params[2]);
        intVote.vote(proposalId, vote);
    }
}
