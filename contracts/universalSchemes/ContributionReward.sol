pragma solidity ^0.4.19;

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
    event ProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId);
    event ProposalDeleted(address indexed _avatar, bytes32 indexed _proposalId);
    event RedeemReputation(address indexed _avatar, bytes32 indexed _proposalId,int _amount);
    event RedeemEther(address indexed _avatar, bytes32 indexed _proposalId,uint _amount);
    event RedeemNativeToken(address indexed _avatar, bytes32 indexed _proposalId,uint _amount);
    event RedeemExternalToken(address indexed _avatar, bytes32 indexed _proposalId,uint _amount);

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
        uint redeemedPeriods;
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
    * @dev constructor
    */
    function ContributionReward() public {}

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
        return (keccak256(_voteApproveParams, _orgNativeTokenFee, _intVote));
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
    *         rewards[3] - Period length
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
        require(_rewards[3] > 0); //proposal.periodLength > 0
        Parameters memory controllerParams = parameters[getParametersFromController(_avatar)];
        // Pay fees for submitting the contribution:
        if (controllerParams.orgNativeTokenFee > 0) {
            _avatar.nativeToken().transferFrom(msg.sender, _avatar, controllerParams.orgNativeTokenFee);
        }

        bytes32 contributionId = controllerParams.intVote.propose(2, controllerParams.voteApproveParams, _avatar, ExecutableInterface(this),msg.sender);

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
            redeemedPeriods:0
        });
        organizationsProposals[_avatar][contributionId] = proposal;

        NewContributionProposal(
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
        // Check if vote was successful:
        if (_param == 1) {
          // solium-disable-next-line security/no-block-members
            organizationsProposals[_avatar][_proposalId].executionTime = now;
        }
        ProposalExecuted(_avatar, _proposalId);
        return true;
    }

    /**
    * @dev redeem reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @param _avatar address of the controller
    * @param _whatToRedeem whatToRedeem array:
    *         whatToRedeem[0] - reputation
    *         whatToRedeem[1] - nativeTokenReward
    *         whatToRedeem[2] - Ether
    *         whatToRedeem[3] - ExternalToken
    * @return  result boolean array for each redeem type.
    */
    function redeem(bytes32 _proposalId, address _avatar,bool[4] _whatToRedeem) public returns(bool[4] result) {

        ContributionProposal memory _proposal = organizationsProposals[_avatar][_proposalId];
        ContributionProposal storage proposal = organizationsProposals[_avatar][_proposalId];
        require(proposal.executionTime != 0);
        ControllerInterface controller = ControllerInterface(Avatar(_avatar).owner());
        uint  amount;
        // solium-disable-next-line security/no-block-members
        uint periodsFromExecution = (now.sub(_proposal.executionTime)).div(_proposal.periodLength);
        uint periodsToPay;

        if (periodsFromExecution >= _proposal.numberOfPeriods) {
            periodsToPay = proposal.numberOfPeriods.sub(_proposal.redeemedPeriods);
        } else {
            periodsToPay = periodsFromExecution.sub(_proposal.redeemedPeriods);
        }
        proposal.redeemedPeriods = proposal.redeemedPeriods.add(periodsToPay);

        if (_whatToRedeem[0]) {
            proposal.reputationChange = 0;
            int reputation = int(periodsToPay) * _proposal.reputationChange;
            if (reputation!=0 && controller.mintReputation(reputation, _proposal.beneficiary,_avatar)) {
                result[0] = true;
                RedeemReputation(_avatar,_proposalId,reputation);
            }
            proposal.reputationChange = _proposal.reputationChange;
        }

        if (_whatToRedeem[1]) {
            proposal.nativeTokenReward = 0;
            amount = periodsToPay.mul(_proposal.nativeTokenReward);
            if (amount > 0 && controller.mintTokens(amount, _proposal.beneficiary,_avatar)) {
                result[1] = true;
                RedeemNativeToken(_avatar,_proposalId,amount);
            }
            proposal.nativeTokenReward = _proposal.nativeTokenReward;
        }

        if (_whatToRedeem[2]) {
            proposal.ethReward = 0;
            amount = periodsToPay.mul(_proposal.ethReward);
            if (amount > 0 && controller.sendEther(amount, _proposal.beneficiary,_avatar)) {
                result[2] = true;
                RedeemEther(_avatar,_proposalId,amount);
            }
            proposal.ethReward = _proposal.ethReward;

        }

        if (_whatToRedeem[3]) {
            if (proposal.externalToken != address(0) && _proposal.externalTokenReward > 0) {
                proposal.externalTokenReward = 0;
                amount = periodsToPay.mul(_proposal.externalTokenReward);
                if (amount > 0 && controller.externalTokenTransfer(_proposal.externalToken, _proposal.beneficiary, amount,_avatar)) {
                    result[3] = true;
                    RedeemExternalToken(_avatar,_proposalId,amount);
                }
                proposal.externalTokenReward = _proposal.externalTokenReward;
            }
        }
        return result;
    }
}
