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

    // Struct holding the data for each organization
    struct Organization {
      bool isRegistered;
      mapping(bytes32=>ContributionProposal) proposals;
    }

    // A mapping from thr organization (Avatar) address to the saved data of the organization:
    mapping(address=>Organization) organizations;

    // A mapping from hashes to parameters (use to store a particular configuration on the controller)
    struct Parameters {
        // A contibution fee can be in the organization token or the scheme token or a combination
        uint orgNativeTokenFee;
        bytes32 voteApproveParams;
        uint schemeNativeTokenFee;
        BoolVoteInterface boolVote;
    }
    mapping(bytes32=>Parameters) parameters;


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
    ) returns(bytes32) {
        bytes32 paramsHash = getParametersHash(_orgNativeTokenFee, _schemeNativeTokenFee, _voteApproveParams, _boolVote);
        parameters[paramsHash].orgNativeTokenFee = _orgNativeTokenFee;
        parameters[paramsHash].schemeNativeTokenFee = _schemeNativeTokenFee;
        parameters[paramsHash].voteApproveParams = _voteApproveParams;
        parameters[paramsHash].boolVote = _boolVote;
        return paramsHash;
    }

    /**
     * @dev return a hash of the given parameters
     * @param _orgNativeTokenFee ???
     * @param _schemeNativeTokenFee ???
     * @param _voteApproveParams parameters for the voting machine used to approve a contribution
     * @param _boolVote the voting machine used to approve a contribution
     * @return a hash of the parameters
     */
    function getParametersHash(
        uint _orgNativeTokenFee,
        uint _schemeNativeTokenFee,
       bytes32 _voteApproveParams,
         BoolVoteInterface _boolVote
    ) constant returns(bytes32) {
        return (sha3(_voteApproveParams, _orgNativeTokenFee, _schemeNativeTokenFee, _boolVote));
    }

    function registerOrganization(Avatar _avatar) {
          // Pay fees for using scheme
          if (fee > 0)
            nativeToken.transferFrom(_avatar, beneficiary, fee);

          // TODO: should we check if the current registrar is registered already on the controller?
          /*require(checkParameterHashMatch(_avatar, _voteRegisterParams, _voteRemoveParams, _boolVote));*/

          // update the organization in the organizations mapping
          Organization memory org;
          org.isRegistered = true;
          organizations[_avatar] = org;
          orgRegistered(_avatar);
    }

    // Sumitting a proposal for a reward against a contribution:
    function submitContribution(
        Avatar _avatar,
        string _contributionDesciption,
        uint _nativeTokenReward,
        uint _reputationReward,
        uint _ethReward,
        StandardToken _externalToken,
        uint _externalTokenReward,
        address _beneficiary
    ) returns(bytes32) {
        require(organizations[_avatar].isRegistered);

        /*bytes32 paramsHash = getParametersFromController(_avatar);*/
        Parameters controllerParams = parameters[getParametersFromController(_avatar)];

        // Pay fees for submitting the contribution:
        _avatar.nativeToken().transferFrom(msg.sender, _avatar, controllerParams.orgNativeTokenFee);
        nativeToken.transferFrom(msg.sender, _avatar, controllerParams.schemeNativeTokenFee);

        BoolVoteInterface boolVote = controllerParams.boolVote;
        bytes32 contributionId = boolVote.propose(controllerParams.voteApproveParams, _avatar, ExecutableInterface(this));

        ContributionProposal memory proposal;
        proposal.contributionDescriptionHash = sha3(_contributionDesciption);
        proposal.nativeTokenReward = _nativeTokenReward;
        proposal.reputationReward = _reputationReward;
        proposal.ethReward = _ethReward;
        proposal.externalToken = _externalToken;
        proposal.externalTokenReward = _externalTokenReward;
        if (_beneficiary == address(0)){
            proposal.beneficiary = msg.sender;
        } else {
            proposal.beneficiary = _beneficiary;
        }
        organizations[_avatar].proposals[contributionId] = proposal;

        return contributionId;
    }

    /**
     * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
     * @param _id the ID of the voting in the voting machine
     * @param _avatar address of the controller
     * @param _param a parameter of the voting result, 0 is no and 1 is yes.
     */
    function execute(bytes32 _id, address _avatar, int _param) returns(bool) {
      // Check if vote was successful:
      if (_param != 1 ) {
        delete organizations[_avatar].proposals[_id];
        return true;
      }
      // Check the caller is indeed the voting machine:
      require(parameters[getParametersFromController(Avatar(_avatar))].boolVote == msg.sender);
      // Define controller and get the parmas:
      Controller controller = Controller(Avatar(_avatar).owner());
      ContributionProposal proposal = organizations[_avatar].proposals[_id];

      // Giving away the funds:
      if (!controller.mintReputation(int(proposal.reputationReward), proposal.beneficiary)) revert();
      if (!controller.mintTokens(proposal.nativeTokenReward, proposal.beneficiary)) revert();
      if (!controller.sendEther(proposal.ethReward, proposal.beneficiary)) revert();
      if (proposal.externalToken != address(0)) {
        if (!controller.externalTokenTransfer(proposal.externalToken, proposal.beneficiary, proposal.externalTokenReward))
            revert();
      }
      delete organizations[_avatar].proposals[_id];
      return true;
    }
}
