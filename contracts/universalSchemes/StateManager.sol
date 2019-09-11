pragma solidity ^0.5.11;

import "@daostack/infra/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "./UniversalScheme.sol";
import "../votingMachines/VotingMachineCallbacks.sol";

/**
 * @title A scheme for recording links to arbitrary states
 * the DAO wants to track.
 * @dev An agent can ask an organization to record a string/string
 * pair naming and linking to some data.
 */

contract StateManager is UniversalScheme, VotingMachineCallbacks, ProposalExecuteInterface {
    using SafeMath for uint;

    event NewStateProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        string _descriptionHash,
        string name
    );

    event ProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId, int256 _param);

    // A struct holding the data for a state management proposal
    struct StateProposal {
        string name;
        string data;
        uint256 periodLength;
        uint256 numberOfPeriods;
        uint256 executionTime;
    }

    // A mapping from organization (Avatar) addresses to mappings of saved proposal data:
    mapping(address=>mapping(bytes32=>StateProposal)) public stateProposals;

    // A mapping from hashes to parameters (use to store a particular configuration on the controller)
    struct Parameters {
        bytes32 voteApproveParams;
        IntVoteInterface intVote;
    }

    mapping(bytes32=>Parameters) public parameters;

    // the STATE! a mapping from organization (Avatar) addresses to mappings of state names to states:
    mapping(address=>mapping(string=>string)) public states;

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _param a parameter of the voting result, 1 is yes and 2 is no.
    */
    function executeProposal(bytes32 _proposalId, int256 _param) external onlyVotingMachine(_proposalId) returns(bool) {
        ProposalInfo memory proposal = proposalsInfo[msg.sender][_proposalId];
        require(stateProposals[address(proposal.avatar)][_proposalId].executionTime == 0);
        // Check if vote was successful:
        if (_param == 1) {
            stateProposals[address(proposal.avatar)][_proposalId].executionTime = now;
            states[address(proposal.avatar)][stateProposals[address(proposal.avatar)][_proposalId].name] 
                = stateProposals[address(proposal.avatar)][_proposalId].data;
        }
        emit ProposalExecuted(address(proposal.avatar), _proposalId, _param);
        return true;
    }

    /**
    * @dev hash the parameters, save them if necessary, and return the hash value
    */
    function setParameters(
        bytes32 _voteApproveParams,
        IntVoteInterface _intVote
    ) public returns(bytes32)
    {
        bytes32 paramsHash = getParametersHash(
            _voteApproveParams,
            _intVote
        );
        parameters[paramsHash].voteApproveParams = _voteApproveParams;
        parameters[paramsHash].intVote = _intVote;
        return paramsHash;
    }

    /**
    * @dev Submit a proposal for a reward for a contribution:
    * @param _avatar Avatar of the organization that the contribution was made for
    * @param _descriptionHash A hash of the proposal's description
    */
    function proposeStateChange(
        Avatar _avatar, 
        string memory _descriptionHash,
        string memory name,
        string memory data
    ) public returns(bytes32) 
    {
        // validateProposalParams(_reputationChange, _rewards);
        Parameters memory controllerParams = parameters[getParametersFromController(_avatar)];

        bytes32 proposalId = controllerParams.intVote.propose(
            2,
            controllerParams.voteApproveParams,
            msg.sender,
            address(_avatar)
        );

        StateProposal memory proposal = StateProposal({
            name: name,
            data: data,
            periodLength: 1,
            numberOfPeriods: 1,
            executionTime: 0
        });
        stateProposals[address(_avatar)][proposalId] = proposal;

        emit NewStateProposal(
            address(_avatar),
            proposalId,
            address(controllerParams.intVote),
            _descriptionHash,
            name
        );

        proposalsInfo[address(controllerParams.intVote)][proposalId] = ProposalInfo({
            blockNumber: block.number,
            avatar: _avatar
        });
        return proposalId;
    }

    function getProposalExecutionTime(bytes32 _proposalId, address _avatar) public view returns (uint256) {
        return stateProposals[_avatar][_proposalId].executionTime;
    }

    /**
    * @dev return a hash of the given parameters
    * @param _voteApproveParams parameters for the voting machine used to approve a contribution
    * @param _intVote the voting machine used to approve a contribution
    * @return a hash of the parameters
    */
    function getParametersHash(
        bytes32 _voteApproveParams,
        IntVoteInterface _intVote
    ) public pure returns(bytes32)
    {
        return (keccak256(abi.encodePacked(_voteApproveParams, _intVote)));
    }

}