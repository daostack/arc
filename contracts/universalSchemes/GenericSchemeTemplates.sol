pragma solidity ^0.5.4;

import "@daostack/infra/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "./UniversalScheme.sol";
import "../votingMachines/VotingMachineCallbacks.sol";
import "./GenericScheme.sol";

/**
 * @title A scheme for registering GenericScheme proposal templates
 */
contract GenericSchemeTemplates is UniversalScheme, VotingMachineCallbacks, ProposalExecuteInterface {

    event ProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId, int256 _param);

    // eslint-disable-next-line max-line-length
    event NewTemplateProposal(bytes32 indexed proposalId, address indexed _avatar, address indexed _genericScheme, string _name, address _contract, string _abi);

    // A mapping from hashes to parameters (use to store a particular configuration on the controller)
    struct Parameters {
        bytes32 voteApproveParams;
        IntVoteInterface intVote;
    }

    // A mapping from hashes to parameters (use to store a particular configuration on the controller)
    mapping(bytes32=>Parameters) public parameters;

    struct Proposal {
        Avatar avatar;
        GenericScheme genericScheme;
        string  name;
        address theContract;
        string  abi;
        uint256 executionTime;
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

    // A mapping from the organization (Avatar) address to the saved data of the organization:
    mapping(address=>mapping(bytes32=>Proposal)) public organizationsProposals;

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _param a parameter of the voting result, 1 yes and 2 is no.
    */
    function executeProposal(bytes32 _proposalId, int256 _param) external onlyVotingMachine(_proposalId) returns(bool) {
        ProposalInfo memory proposalInfo = proposalsInfo[msg.sender][_proposalId];
        Proposal memory proposal = organizationsProposals[address(proposalInfo.avatar)][_proposalId];
        require(proposalInfo.avatar == proposal.avatar);
        require(proposal.executionTime == 0);
        require(bytes(proposal.name).length != 0);
        require(proposal.theContract != address(0));
        require(proposal.avatar != Avatar(0));
        require(proposal.genericScheme != GenericScheme(0));
        require(bytes(proposal.abi).length != 0);
        // Check if vote was successful:
        if (_param == 1) {
          // solhint-disable-next-line not-rely-on-time
            organizationsProposals[address(proposal.avatar)][_proposalId].executionTime = now;
        }
        emit ProposalExecuted(address(proposal.avatar), _proposalId, _param);
        return true;
    }

    /**
    * @dev Submit a proposal
    */
    function propose(
        /**
         * the avatar to which the GenericScheme is registered
         */
        Avatar _avatar,
        /**
         * the registered GenericScheme
         */
        GenericScheme _genericScheme,
        /**
         * The abi describing a function that GenericScheme would invoke when executed.
         * The _abi may be missing values for one or more function parameters, and dApps may
         * prompt users to supply the missing values before
         * submitting proposals to GenesisScheme to invoke the function.
         */
        string memory _abi,
        /**
         * A name that may be used, for example, to identify a GUI form by which an
         * incomplete _abi may be filled-in by the user prior to submitting a proposal
         * to invoke the function described by _abi.
         */
        string memory _name,
        /**
         * address of the contract that implements the function described by _abi.
         */
        address _contract
    )
    public
    returns(bytes32)
    {
        validateProposalParams(_avatar, _genericScheme, _abi, _name, _contract);

        Parameters memory controllerParams = parameters[getParametersFromController(_avatar)];

        bytes32 proposalId = controllerParams.intVote.propose(
            2,
            controllerParams.voteApproveParams,
            msg.sender,
            address(_avatar)
        );

        Proposal memory proposal = Proposal({
            avatar: _avatar,
            genericScheme: _genericScheme,
            name: _name,
            theContract: _contract,
            abi: _abi,
            executionTime: 0
        });

        organizationsProposals[address(_avatar)][proposalId] = proposal;

        emit NewTemplateProposal(
            proposalId,
            address(_avatar),
            address(_genericScheme),
            _name,
            _contract,
            _abi
        );

        proposalsInfo[address(controllerParams.intVote)][proposalId] = ProposalInfo({
            blockNumber:block.number,
            avatar:_avatar
        });
        return proposalId;
    }

    function validateProposalParams(
        Avatar _avatar,
        GenericScheme _genericScheme,
        string memory _abi,
        string memory _name,
        address _contract
    ) private pure {
        require(_avatar != Avatar(0), "_avatar is not set");
        require(_genericScheme != GenericScheme(0), "_genericScheme is not set");
        require(_contract != address(0), "_contract is not set");
        require(bytes(_name).length != 0, "_name is not set");
        require(bytes(_abi).length != 0, "_abi is not set");
    }
}
