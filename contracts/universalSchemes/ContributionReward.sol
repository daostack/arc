pragma solidity ^0.4.18;

import "../VotingMachines/IntVoteInterface.sol";
import "./UniversalScheme.sol";


/**
 * @title A scheme for proposing and rewarding contributions to an organization
 * @dev An agent can ask an organization to recognize a contribution and reward
 * him with token, reputation, ether or any combination.
 */

contract ContributionReward is UniversalScheme {
    event LogNewContributionProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        bytes32 _contributionDesciption,
        uint _nativeTokenReward,
        uint _reputationReward,
        uint _ethReward,
        uint _externalTokenReward,
        StandardToken _externalToken,
        address _beneficiary
    );
    event LogProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId);
    event LogProposalDeleted(address indexed _avatar, bytes32 indexed _proposalId);

    // A struct holding the data for a contribution proposal
    struct ContributionProposal {
        bytes32 contributionDescriptionHash; // Hash of contribution document.
        uint nativeTokenReward; // Reward asked in the native token of the organization.
        uint reputationReward; // Organization reputation reward requested.
        uint ethReward;
        StandardToken externalToken;
        uint externalTokenReward;
        address beneficiary;
    }

    // A mapping from the organization (Avatar) address to the saved data of the organization:
    mapping(address=>mapping(bytes32=>ContributionProposal)) public organizationsProposals;

    // A mapping from hashes to parameters (use to store a particular configuration on the controller)
    // A contibution fee can be in the organization token or the scheme token or a combination
    struct Parameters {
        uint orgNativeTokenFee; // a fee (in the organization's token) that is to be paid for submitting a contribution
        bytes32 voteApproveParams;
        uint schemeNativeTokenFee; // a fee (in the present schemes token)  that is to be paid for submission
        IntVoteInterface intVote;
    }
    // A mapping from hashes to parameters (use to store a particular configuration on the controller)
    mapping(bytes32=>Parameters) public parameters;

    /**
    * @dev the constructor takes a token address, fee and beneficiary
    */
    function ContributionReward(StandardToken _nativeToken, uint _fee, address _beneficiary) public {
        updateParameters(_nativeToken, _fee, _beneficiary, bytes32(0));
    }

    /**
    * @dev hash the parameters, save them if necessary, and return the hash value
    */
    function setParameters(
        uint _orgNativeTokenFee,
        uint _schemeNativeTokenFee,
        bytes32 _voteApproveParams,
        IntVoteInterface _intVote
    ) public returns(bytes32)
    {
        bytes32 paramsHash = getParametersHash(
            _orgNativeTokenFee,
            _schemeNativeTokenFee,
            _voteApproveParams,
            _intVote
        );
        parameters[paramsHash].orgNativeTokenFee = _orgNativeTokenFee;
        parameters[paramsHash].schemeNativeTokenFee = _schemeNativeTokenFee;
        parameters[paramsHash].voteApproveParams = _voteApproveParams;
        parameters[paramsHash].intVote = _intVote;
        return paramsHash;
    }

    /**
    * @dev return a hash of the given parameters
    * @param _orgNativeTokenFee the fee for submitting a contribution in organizations native token
    * @param _schemeNativeTokenFee the fee for submitting a contribution if paied in schemes native token
    * @param _voteApproveParams parameters for the voting machine used to approve a contribution
    * @param _intVote the voting machine used to approve a contribution
    * @return a hash of the parameters
    */
    // TODO: These fees are messy. Better to have a _fee and _feeToken pair, just as in some other contract (which one?) with some sane default
    function getParametersHash(
        uint _orgNativeTokenFee,
        uint _schemeNativeTokenFee,
        bytes32 _voteApproveParams,
        IntVoteInterface _intVote
    ) public pure returns(bytes32)
    {
        return (keccak256(_voteApproveParams, _orgNativeTokenFee, _schemeNativeTokenFee, _intVote));
    }

    /**
    * @dev Submit a proposal for a reward for a contribution:
    * @param _avatar Avatar of the organization that the contribution was made for
    * @param _contributionDesciptionHash A hash of the contribution's description
    * @param _rewards rewards array:
    *         rewards[0] - Amount of tokens requested
    *         rewards[1] - Amount of reputation requested
    *         rewards[2] - Amount of ETH requested
    *         rewards[3] - Amount of extenral tokens requested
    * @param _externalToken Address of external token, if reward is requested there
    * @param _beneficiary Who gets the rewards
    */
    function proposeContributionReward(
        Avatar _avatar,
        bytes32 _contributionDesciptionHash,
        uint[4] _rewards,
        StandardToken _externalToken,
        address _beneficiary
    ) public
      onlyRegisteredOrganization(_avatar)
      returns(bytes32)
    {
        Parameters memory controllerParams = parameters[getParametersFromController(_avatar)];
        // Pay fees for submitting the contribution:
        if (controllerParams.orgNativeTokenFee > 0) {
            _avatar.nativeToken().transferFrom(msg.sender, _avatar, controllerParams.orgNativeTokenFee);
        }
        if (controllerParams.schemeNativeTokenFee > 0) {
            nativeToken.transferFrom(msg.sender, _avatar, controllerParams.schemeNativeTokenFee);
        }

        bytes32 contributionId = controllerParams.intVote.propose(2, controllerParams.voteApproveParams, _avatar, ExecutableInterface(this));

        // Check beneficiary is not null:
        if (_beneficiary == address(0)) {
            _beneficiary = msg.sender;
        }

        // Set the struct:
        ContributionProposal memory proposal = ContributionProposal({
            contributionDescriptionHash: _contributionDesciptionHash,
            nativeTokenReward: _rewards[0],
            reputationReward: _rewards[1],
            ethReward: _rewards[2],
            externalToken: _externalToken,
            externalTokenReward: _rewards[3],
            beneficiary: _beneficiary
        });
        organizationsProposals[_avatar][contributionId] = proposal;

        LogNewContributionProposal(
            _avatar,
            contributionId,
            controllerParams.intVote,
            _contributionDesciptionHash,
            _rewards[0],
            _rewards[1],
            _rewards[2],
            _rewards[3],
            _externalToken,
            _beneficiary
        );

        // vote for this proposal
        controllerParams.intVote.ownerVote(contributionId, 1, msg.sender); // Automatically votes `yes` in the name of the opener.
        return contributionId;
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
        // Check if vote was successful:
        if (_param == 1) {
        // Define controller and get the parmas:
            ContributionProposal memory proposal = organizationsProposals[_avatar][_proposalId];

        // pay the funds:
            Controller controller = Controller(Avatar(_avatar).owner());
            if (!controller.mintReputation(int(proposal.reputationReward), proposal.beneficiary)) {
                revert();
              }
            if (!controller.mintTokens(proposal.nativeTokenReward, proposal.beneficiary)) {
                revert();
              }
            if (!controller.sendEther(proposal.ethReward, proposal.beneficiary)) {
                revert();
              }
            if (proposal.externalToken != address(0) && proposal.externalTokenReward > 0) {
                if (!controller.externalTokenTransfer(proposal.externalToken, proposal.beneficiary, proposal.externalTokenReward)) {
                    revert();
                  }
                }
          }
        delete organizationsProposals[_avatar][_proposalId];
        LogProposalExecuted(_avatar, _proposalId);
        return true;
    }
}
