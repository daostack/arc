pragma solidity ^0.4.24;

import "../VotingMachines/IntVoteInterface.sol";
import "./UniversalScheme.sol";


/**
 * @title A scheme for proposing and rewarding contributions to an organization
 * @dev An agent can ask an organization to recognize a contribution and reward
 * him with token, reputation, ether or any combination.
 */

contract ContributionReward is UniversalScheme {
    using SafeMath for uint;

    event NewContributionProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        bytes32 _contributionDescription,
        int _reputationChange,
        uint[5]  _rewards,
        StandardToken _externalToken,
        address _beneficiary
    );
    event ProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId,int _param);
    event RedeemReputation(address indexed _avatar, bytes32 indexed _proposalId, address indexed _beneficiary,int _amount);
    event RedeemEther(address indexed _avatar, bytes32 indexed _proposalId, address indexed _beneficiary,uint _amount);
    event RedeemNativeToken(address indexed _avatar, bytes32 indexed _proposalId, address indexed _beneficiary,uint _amount);
    event RedeemExternalToken(address indexed _avatar, bytes32 indexed _proposalId, address indexed _beneficiary,uint _amount);

    // A struct holding the data for a contribution proposal
    struct ContributionProposal {
        bytes32 contributionDescriptionHash; // Hash of contribution document.
        uint nativeTokenReward; // Reward asked in the native token of the organization.
        int reputationChange; // Organization reputation reward requested.
        uint ethReward;
        StandardToken externalToken;
        uint externalTokenReward;
        address beneficiary;
        uint periodLength;
        uint numberOfPeriods;
        uint executionTime;
        uint[4] redeemedPeriods;
    }

    // A mapping from the organization (Avatar) address to the saved data of the organization:
    mapping(address=>mapping(bytes32=>ContributionProposal)) public organizationsProposals;

    // A mapping from hashes to parameters (use to store a particular configuration on the controller)
    // A contribution fee can be in the organization token or the scheme token or a combination
    struct Parameters {
        uint orgNativeTokenFee; // a fee (in the organization's token) that is to be paid for submitting a contribution
        bytes32 voteApproveParams;
        IntVoteInterface intVote;
    }
    // A mapping from hashes to parameters (use to store a particular configuration on the controller)
    mapping(bytes32=>Parameters) public parameters;

    /**
    * @dev hash the parameters, save them if necessary, and return the hash value
    */
    function setParameters(
        uint _orgNativeTokenFee,
        bytes32 _voteApproveParams,
        IntVoteInterface _intVote
    ) public returns(bytes32)
    {
        bytes32 paramsHash = getParametersHash(
            _orgNativeTokenFee,
            _voteApproveParams,
            _intVote
        );
        parameters[paramsHash].orgNativeTokenFee = _orgNativeTokenFee;
        parameters[paramsHash].voteApproveParams = _voteApproveParams;
        parameters[paramsHash].intVote = _intVote;
        return paramsHash;
    }

    /**
    * @dev return a hash of the given parameters
    * @param _orgNativeTokenFee the fee for submitting a contribution in organizations native token
    * @param _voteApproveParams parameters for the voting machine used to approve a contribution
    * @param _intVote the voting machine used to approve a contribution
    * @return a hash of the parameters
    */
    // TODO: These fees are messy. Better to have a _fee and _feeToken pair, just as in some other contract (which one?) with some sane default
    function getParametersHash(
        uint _orgNativeTokenFee,
        bytes32 _voteApproveParams,
        IntVoteInterface _intVote
    ) public pure returns(bytes32)
    {
        return (keccak256(abi.encodePacked(_voteApproveParams, _orgNativeTokenFee, _intVote)));
    }

    /**
    * @dev Submit a proposal for a reward for a contribution:
    * @param _avatar Avatar of the organization that the contribution was made for
    * @param _contributionDescriptionHash A hash of the contribution's description
    * @param _reputationChange - Amount of reputation change requested .Can be negative.
    * @param _rewards rewards array:
    *         rewards[0] - Amount of tokens requested per period
    *         rewards[1] - Amount of ETH requested per period
    *         rewards[2] - Amount of external tokens requested per period
    *         rewards[3] - Period length - if set to zero it allows immediate redeeming after execution.
    *         rewards[4] - Number of periods
    * @param _externalToken Address of external token, if reward is requested there
    * @param _beneficiary Who gets the rewards
    */
    function proposeContributionReward(
        Avatar _avatar,
        bytes32 _contributionDescriptionHash,
        int _reputationChange,
        uint[5] _rewards,
        StandardToken _externalToken,
        address _beneficiary
    ) public
      returns(bytes32)
    {
        require(((_rewards[3] > 0) || (_rewards[4] == 1)),"periodLength equal 0 require numberOfPeriods to be 1");
        Parameters memory controllerParams = parameters[getParametersFromController(_avatar)];
        // Pay fees for submitting the contribution:
        if (controllerParams.orgNativeTokenFee > 0) {
            _avatar.nativeToken().transferFrom(msg.sender, _avatar, controllerParams.orgNativeTokenFee);
        }

        bytes32 contributionId = controllerParams.intVote.propose(
            2,
            controllerParams.voteApproveParams,
           _avatar,
           ExecutableInterface(this),
           msg.sender
        );

        // Check beneficiary is not null:
        address beneficiary = _beneficiary;
        if (beneficiary == address(0)) {
            beneficiary = msg.sender;
        }

        // Set the struct:
        ContributionProposal memory proposal = ContributionProposal({
            contributionDescriptionHash: _contributionDescriptionHash,
            nativeTokenReward: _rewards[0],
            reputationChange: _reputationChange,
            ethReward: _rewards[1],
            externalToken: _externalToken,
            externalTokenReward: _rewards[2],
            beneficiary: beneficiary,
            periodLength: _rewards[3],
            numberOfPeriods: _rewards[4],
            executionTime: 0,
            redeemedPeriods:[uint(0),uint(0),uint(0),uint(0)]
        });
        organizationsProposals[_avatar][contributionId] = proposal;

        emit NewContributionProposal(
            _avatar,
            contributionId,
            controllerParams.intVote,
            _contributionDescriptionHash,
            _reputationChange,
            _rewards,
            _externalToken,
            beneficiary
        );

        // vote for this proposal
        controllerParams.intVote.ownerVote(contributionId, 1, msg.sender); // Automatically votes `yes` in the name of the opener.
        return contributionId;
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _avatar address of the controller
    * @param _param a parameter of the voting result, 1 yes and 2 is no.
    */
    function execute(bytes32 _proposalId, address _avatar, int _param) public returns(bool) {
        // Check the caller is indeed the voting machine:
        require(parameters[getParametersFromController(Avatar(_avatar))].intVote == msg.sender);
        require(organizationsProposals[_avatar][_proposalId].executionTime == 0);
        require(organizationsProposals[_avatar][_proposalId].beneficiary != address(0));
        // Check if vote was successful:
        if (_param == 1) {
          // solium-disable-next-line security/no-block-members
            organizationsProposals[_avatar][_proposalId].executionTime = now;
        }
        emit ProposalExecuted(_avatar, _proposalId,_param);
        return true;
    }

    /**
    * @dev RedeemReputation reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @param _avatar address of the controller
    * @return reputation the redeemed reputation.
    */
    function redeemReputation(bytes32 _proposalId, address _avatar) public returns(int reputation) {

        ContributionProposal memory _proposal = organizationsProposals[_avatar][_proposalId];
        ContributionProposal storage proposal = organizationsProposals[_avatar][_proposalId];
        require(proposal.executionTime != 0);
        uint periodsToPay = getPeriodsToPay(_proposalId,_avatar,0);

        //set proposal reward to zero to prevent reentrancy attack.
        proposal.reputationChange = 0;
        reputation = int(periodsToPay) * _proposal.reputationChange;
        if (reputation > 0 ) {
            require(ControllerInterface(Avatar(_avatar).owner()).mintReputation(uint(reputation), _proposal.beneficiary,_avatar));
        } else if (reputation < 0 ) {
            require(ControllerInterface(Avatar(_avatar).owner()).burnReputation(uint(reputation*(-1)), _proposal.beneficiary,_avatar));
        }
        if (reputation != 0) {
            proposal.redeemedPeriods[0] = proposal.redeemedPeriods[0].add(periodsToPay);
            emit RedeemReputation(_avatar,_proposalId,_proposal.beneficiary,reputation);
        }
        //restore proposal reward.
        proposal.reputationChange = _proposal.reputationChange;
    }

    /**
    * @dev RedeemNativeToken reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @param _avatar address of the controller
    * @return amount the redeemed nativeToken.
    */
    function redeemNativeToken(bytes32 _proposalId, address _avatar) public returns(uint amount) {

        ContributionProposal memory _proposal = organizationsProposals[_avatar][_proposalId];
        ContributionProposal storage proposal = organizationsProposals[_avatar][_proposalId];
        require(proposal.executionTime != 0);
        uint periodsToPay = getPeriodsToPay(_proposalId,_avatar,1);
        //set proposal rewards to zero to prevent reentrancy attack.
        proposal.nativeTokenReward = 0;

        amount = periodsToPay.mul(_proposal.nativeTokenReward);
        if (amount > 0) {
            require(ControllerInterface(Avatar(_avatar).owner()).mintTokens(amount, _proposal.beneficiary,_avatar));
            proposal.redeemedPeriods[1] = proposal.redeemedPeriods[1].add(periodsToPay);
            emit RedeemNativeToken(_avatar,_proposalId,_proposal.beneficiary,amount);
        }

        //restore proposal reward.
        proposal.nativeTokenReward = _proposal.nativeTokenReward;
    }

    /**
    * @dev RedeemEther reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @param _avatar address of the controller
    * @return amount ether redeemed amount
    */
    function redeemEther(bytes32 _proposalId, address _avatar) public returns(uint amount) {

        ContributionProposal memory _proposal = organizationsProposals[_avatar][_proposalId];
        ContributionProposal storage proposal = organizationsProposals[_avatar][_proposalId];
        require(proposal.executionTime != 0);
        uint periodsToPay = getPeriodsToPay(_proposalId,_avatar,2);
        //set proposal rewards to zero to prevent reentrancy attack.
        proposal.ethReward = 0;
        amount = periodsToPay.mul(_proposal.ethReward);

        if (amount > 0) {
            require(ControllerInterface(Avatar(_avatar).owner()).sendEther(amount, _proposal.beneficiary,_avatar));
            proposal.redeemedPeriods[2] = proposal.redeemedPeriods[2].add(periodsToPay);
            emit RedeemEther(_avatar,_proposalId,_proposal.beneficiary,amount);
        }

        //restore proposal reward.
        proposal.ethReward = _proposal.ethReward;
    }

    /**
    * @dev RedeemNativeToken reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @param _avatar address of the controller
    * @return amount the external token redeemed amount
    */
    function redeemExternalToken(bytes32 _proposalId, address _avatar) public returns(uint amount) {

        ContributionProposal memory _proposal = organizationsProposals[_avatar][_proposalId];
        ContributionProposal storage proposal = organizationsProposals[_avatar][_proposalId];
        require(proposal.executionTime != 0);
        uint periodsToPay = getPeriodsToPay(_proposalId,_avatar,3);
        //set proposal rewards to zero to prevent reentrancy attack.
        proposal.externalTokenReward = 0;

        if (proposal.externalToken != address(0) && _proposal.externalTokenReward > 0) {
            amount = periodsToPay.mul(_proposal.externalTokenReward);
            if (amount > 0) {
                require(ControllerInterface(Avatar(_avatar).owner()).externalTokenTransfer(_proposal.externalToken, _proposal.beneficiary, amount,_avatar));
                proposal.redeemedPeriods[3] = proposal.redeemedPeriods[3].add(periodsToPay);
                emit RedeemExternalToken(_avatar,_proposalId,_proposal.beneficiary,amount);
            }
        }
        //restore proposal reward.
        proposal.externalTokenReward = _proposal.externalTokenReward;
    }

    /**
    * @dev redeem rewards for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @param _avatar address of the controller
    * @param _whatToRedeem whatToRedeem array:
    *         whatToRedeem[0] - reputation
    *         whatToRedeem[1] - nativeTokenReward
    *         whatToRedeem[2] - Ether
    *         whatToRedeem[3] - ExternalToken
    * @return  result boolean array for each redeem type.
    */
    function redeem(bytes32 _proposalId, address _avatar,bool[4] _whatToRedeem)
    public
    returns(int reputationReward,uint nativeTokenReward,uint etherReward,uint externalTokenReward)
    {

        if (_whatToRedeem[0]) {
            reputationReward = redeemReputation(_proposalId,_avatar);
        }

        if (_whatToRedeem[1]) {
            nativeTokenReward = redeemNativeToken(_proposalId,_avatar);
        }

        if (_whatToRedeem[2]) {
            etherReward = redeemEther(_proposalId,_avatar);
        }

        if (_whatToRedeem[3]) {
            externalTokenReward = redeemExternalToken(_proposalId,_avatar);
        }
    }

    /**
    * @dev getPeriodsToPay return the periods left to be paid for reputation,nativeToken,ether or externalToken.
    * The function ignore the reward amount to be paid (which can be zero).
    * @param _proposalId the ID of the voting in the voting machine
    * @param _avatar address of the controller
    * @param _redeemType - the type of the reward  :
    *         0 - reputation
    *         1 - nativeTokenReward
    *         2 - Ether
    *         3 - ExternalToken
    * @return  periods left to be paid.
    */
    function getPeriodsToPay(bytes32 _proposalId, address _avatar,uint _redeemType) public view returns (uint) {
        ContributionProposal memory _proposal = organizationsProposals[_avatar][_proposalId];
        if (_proposal.executionTime == 0)
            return 0;
        uint periodsFromExecution;
        if (_proposal.periodLength > 0) {
          // solium-disable-next-line security/no-block-members
            periodsFromExecution = (now.sub(_proposal.executionTime))/(_proposal.periodLength);
        }
        uint periodsToPay;
        if ((_proposal.periodLength == 0) || (periodsFromExecution >= _proposal.numberOfPeriods)) {
            periodsToPay = _proposal.numberOfPeriods.sub(_proposal.redeemedPeriods[_redeemType]);
        } else {
            periodsToPay = periodsFromExecution.sub(_proposal.redeemedPeriods[_redeemType]);
        }
        return periodsToPay;
    }

    /**
    * @dev getRedeemedPeriods return the already redeemed periods for reputation, nativeToken, ether or externalToken.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _avatar address of the controller
    * @param _redeemType - the type of the reward  :
    *         0 - reputation
    *         1 - nativeTokenReward
    *         2 - Ether
    *         3 - ExternalToken
    * @return redeemed period.
    */
    function getRedeemedPeriods(bytes32 _proposalId, address _avatar,uint _redeemType) public view returns (uint) {
        return organizationsProposals[_avatar][_proposalId].redeemedPeriods[_redeemType];
    }

    function getProposalEthReward(bytes32 _proposalId, address _avatar) public view returns (uint) {
        return organizationsProposals[_avatar][_proposalId].ethReward;
    }

    function getProposalExternalTokenReward(bytes32 _proposalId, address _avatar) public view returns (uint) {
        return organizationsProposals[_avatar][_proposalId].externalTokenReward;
    }

    function getProposalExternalToken(bytes32 _proposalId, address _avatar) public view returns (address) {
        return organizationsProposals[_avatar][_proposalId].externalToken;
    }

    function getProposalExecutionTime(bytes32 _proposalId, address _avatar) public view returns (uint) {
        return organizationsProposals[_avatar][_proposalId].executionTime;
    }

}
