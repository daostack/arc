pragma solidity ^0.4.11;

import "../VotingMachines/BoolVoteInterface.sol";
import "./UniversalScheme.sol";

/**
 * @title A scheme for proposing and rewarding contributions to an organization
 * @dev An agent can ask an organization to recognize a contribution and reward
 * him with token, reputation, ether or any combination.
 */


contract SimpleContributionScheme is UniversalScheme {

    // A struct holding the data for a contribution proposal
    struct ContributionProposal {
      bytes32 contributionDescriptionHash; // Hash of contributtion document.
      uint nativeTokenReward; // Reward asked in the native token of the organization.
      uint reputationReward; // Organization reputation reward requested.
      uint ethReward;
      StandardToken externalToken;
      uint externalTokenReward;
      address beneficiary;
    }

    mapping(bytes32=>ContributionProposal) public proposals;

    // Struct holding the data for each organization
    struct Organization {
      bool isRegistered;
      mapping(bytes32=>ContributionProposal) proposals;
    }

    // A mapping from thr organization (Avatar) address to the saved data of the organization:
    mapping(address=>Organization) public organizations;

    // A mapping from hashes to parameters (use to store a particular configuration on the controller)
    struct Parameters {
      uint orgNativeTokenFee; // a fee (in the organization's token) that is to be paid for submitting a contribution
      bytes32 voteApproveParams;
      uint schemeNativeTokenFee; // a fee (in the present schemes token)  that is to be paid for submission
      BoolVoteInterface boolVote;
    }
        // A contibution fee can be in the organization token or the scheme token or a combination
    mapping(bytes32=>Parameters) public parameters;

    event LogNewProposal(bytes32 proposalId);
    /**
     * @dev the constructor takes a token address, fee and beneficiary
     */
    function SimpleContributionScheme(StandardToken _nativeToken, uint _fee, address _beneficiary) {
      updateParameters(_nativeToken, _fee, _beneficiary, bytes32(0));
    }

    /**
     * @dev hash the parameters, save them if necessary, and return the hash value
     */
    function setParameters(
        uint _orgNativeTokenFee,
        uint _schemeNativeTokenFee,
        bytes32 _voteApproveParams,
        BoolVoteInterface _boolVote
    ) returns(bytes32)
    {
        bytes32 paramsHash = getParametersHash(_orgNativeTokenFee, _schemeNativeTokenFee, _voteApproveParams, _boolVote);
        parameters[paramsHash].orgNativeTokenFee = _orgNativeTokenFee;
        parameters[paramsHash].schemeNativeTokenFee = _schemeNativeTokenFee;
        parameters[paramsHash].voteApproveParams = _voteApproveParams;
        parameters[paramsHash].boolVote = _boolVote;
        return paramsHash;
    }

    /**
     * @dev return a hash of the given parameters
     * @param _orgNativeTokenFee the fee for submitting a contribution in organizations native token
     * @param _schemeNativeTokenFee the fee for submitting a contribution if paied in schemes native token
     * @param _voteApproveParams parameters for the voting machine used to approve a contribution
     * @param _boolVote the voting machine used to approve a contribution
     * @return a hash of the parameters
     */
    // TODO: These fees are messy. Better to have a _fee and _feeToken pair, just as in some other contract (which one?) with some sane default
    function getParametersHash(
        uint _orgNativeTokenFee,
        uint _schemeNativeTokenFee,
        bytes32 _voteApproveParams,
        BoolVoteInterface _boolVote
    ) constant returns(bytes32)
    {
        return (sha3(_voteApproveParams, _orgNativeTokenFee, _schemeNativeTokenFee, _boolVote));
    }

    function registerOrganization(Avatar _avatar) {
          // Pay fees for using scheme
          if ((fee > 0) && (!organizations[_avatar].isRegistered)) {
            nativeToken.transferFrom(_avatar, beneficiary, fee);
          }

          // TODO: should we check if the current registrar is registered already on the controller?
          /*require(checkParameterHashMatch(_avatar, _voteRegisterParams, _voteRemoveParams, _boolVote));*/

          // update the organization in the organizations mapping
          Organization memory org;
          org.isRegistered = true;
          organizations[_avatar] = org;
          LogOrgRegistered(_avatar);
    }

    /**
     * @dev Submit a proposal for a reward for a contribution:
     * @param _avatar Avatar of the organization that the contribution was made for
     * @param _contributionDesciption A description of the contribution
     * @param _nativeTokenReward The amount of tokens requested
     * @param _reputationReward The amount of rewards requested
     * @param _ethReward Amount of ETH requested
     * @param _externalToken Address of external token, if reward is requested there
     * @param _externalTokenReward Amount of extenral tokens requested
     * @param _beneficiary Who gets the rewards
     */
    function submitContribution(
        Avatar _avatar,
        string _contributionDesciption,
        uint _nativeTokenReward,
        uint _reputationReward,
        uint _ethReward,
        StandardToken _externalToken,
        uint _externalTokenReward,
        address _beneficiary
    ) returns(bytes32)
    {
        require(organizations[_avatar].isRegistered);

        Parameters memory controllerParams = parameters[getParametersFromController(_avatar)];

        // Pay fees for submitting the contribution:
        if (controllerParams.schemeNativeTokenFee > 0) {
            _avatar.nativeToken().transferFrom(msg.sender, _avatar, controllerParams.orgNativeTokenFee);
        }
        if (controllerParams.schemeNativeTokenFee > 0) {
            nativeToken.transferFrom(msg.sender, _avatar, controllerParams.schemeNativeTokenFee);
        }

        BoolVoteInterface boolVote = controllerParams.boolVote;
        bytes32 contributionId = boolVote.propose(controllerParams.voteApproveParams, _avatar, ExecutableInterface(this));

        ContributionProposal memory proposal;
        proposal.contributionDescriptionHash = sha3(_contributionDesciption);
        proposal.nativeTokenReward = _nativeTokenReward;
        proposal.reputationReward = _reputationReward;
        proposal.ethReward = _ethReward;
        proposal.externalToken = _externalToken;
        proposal.externalTokenReward = _externalTokenReward;
        if (_beneficiary == address(0)) {
            proposal.beneficiary = msg.sender;
        } else {
            proposal.beneficiary = _beneficiary;
        }
        proposals[contributionId] = proposal;

        LogNewProposal(contributionId);

        return contributionId;
    }

    /**
     * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
     * @param _proposalId the ID of the voting in the voting machine
     * @param _avatar address of the controller
     * @param _param a parameter of the voting result, 0 is no and 1 is yes.
     */
    function execute(bytes32 _proposalId, address _avatar, int _param) returns(bool) {
        // Check the caller is indeed the voting machine:
        require(parameters[getParametersFromController(Avatar(_avatar))].boolVote == msg.sender);
        // Check if vote was successful:
        if (_param != 1) {
            delete proposals[_proposalId];
            return true;
        }

        // Define controller and get the parmas:
        ContributionProposal memory proposal = proposals[_proposalId];

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
        delete proposals[_proposalId];
        return true;
    }

    function isRegistered(address _avatar) constant returns(bool) {
      return organizations[_avatar].isRegistered;
    }

}
