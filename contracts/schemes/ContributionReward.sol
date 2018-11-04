pragma solidity ^0.4.24;

import "../VotingMachines/GenesisProtocolCallbacks.sol";
import "./ProxyScheme.sol";


/**
 * @title A scheme for proposing and rewarding contributions to an organization
 * @dev An agent can ask an organization to recognize a contribution and reward
 * him with token, reputation, ether or any combination.
 */

contract ContributionReward is ProxyScheme, GenesisProtocolCallbacks, GenesisProtocolExecuteInterface {
    using SafeMath for uint;

    event NewContributionProposal(
        bytes32 indexed _proposalId,
        bytes32 _contributionDescription,
        int _reputationChange,
        uint[5]  _rewards,
        StandardToken _externalToken,
        address _beneficiary
    );
    event ProposalExecuted(bytes32 indexed _proposalId, int _param);
    event RedeemReputation(bytes32 indexed _proposalId, address indexed _beneficiary, int _amount);
    event RedeemEther(bytes32 indexed _proposalId, address indexed _beneficiary, uint _amount);
    event RedeemNativeToken(bytes32 indexed _proposalId, address indexed _beneficiary, uint _amount);
    event RedeemExternalToken(bytes32 indexed _proposalId, address indexed _beneficiary, uint _amount);

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

    mapping(bytes32 => ContributionProposal) public organizationProposals;
    
    IntVoteInterface public intVote;
    bytes32 public voteApproveParams;
    uint public orgNativeTokenFee; // a fee (in the organization's token) that is to be paid for submitting a contribution

    function init(
        Avatar _avatar,
        IntVoteInterface _intVote,
        bytes32 _voteApproveParams,
        uint _orgNativeTokenFee
    ) external
    {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");

        avatar = _avatar;
        intVote = _intVote;
        voteApproveParams = _voteApproveParams;
        orgNativeTokenFee = _orgNativeTokenFee;
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _param a parameter of the voting result, 1 yes and 2 is no.
    */
    function executeProposal(bytes32 _proposalId, int _param) external onlyVotingMachine(_proposalId) returns(bool) {
        require(organizationProposals[_proposalId].executionTime == 0, "Proposal already executed");
        require(organizationProposals[_proposalId].beneficiary != address(0), "Proposal doesn't exist");
        
        // Check if vote was successful:
        if (_param == 1) {
          // solium-disable-next-line security/no-block-members
            organizationProposals[_proposalId].executionTime = now;
        }

        emit ProposalExecuted(_proposalId, _param);
        return true;
    }

    /**
    * @dev Submit a proposal for a reward for a contribution:
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
        bytes32 _contributionDescriptionHash,
        int _reputationChange,
        uint[5] _rewards,
        StandardToken _externalToken,
        address _beneficiary
    ) public
      returns(bytes32)
    {
        require(((_rewards[3] > 0) || (_rewards[4] == 1)), "periodLength equal 0 require numberOfPeriods to be 1");

        // Pay fees for submitting the contribution:
        if (orgNativeTokenFee > 0) {
            avatar.nativeToken().transferFrom(msg.sender, avatar, orgNativeTokenFee);
        }

        bytes32 contributionId = intVote.propose(
            2,
           voteApproveParams,
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
            redeemedPeriods:[uint(0), uint(0), uint(0), uint(0)]
        });

        organizationProposals[contributionId] = proposal;

        emit NewContributionProposal(
            contributionId,
            _contributionDescriptionHash,
            _reputationChange,
            _rewards,
            _externalToken,
            beneficiary
        );

        proposalsInfo[contributionId] = ProposalInfo({
            blockNumber: block.number,
            avatar: avatar,
            votingMachine: intVote
        });

        // vote for this proposal
        intVote.ownerVote(contributionId, 1, msg.sender); // Automatically votes `yes` in the name of the opener.

        return contributionId;
    }

    /**
    * @dev RedeemReputation reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @return reputation the redeemed reputation.
    */
    function redeemReputation(bytes32 _proposalId) public returns(int reputation) {
        ContributionProposal memory _proposal = organizationProposals[_proposalId];
        ContributionProposal storage proposal = organizationProposals[_proposalId];
        
        require(proposal.executionTime != 0, "proposal was not accepted");
        
        uint periodsToPay = getPeriodsToPay(_proposalId, 0);

        // set proposal reward to zero to prevent reentrancy attack.
        proposal.reputationChange = 0;

        reputation = int(periodsToPay) * _proposal.reputationChange;

        if (reputation > 0 ) {
            require(
                ControllerInterface(Avatar(avatar).owner())
                .mintReputation(uint(reputation), _proposal.beneficiary),
                "Failed to mint reputation"
            );
        } else if (reputation < 0 ) {
            require(
                ControllerInterface(Avatar(avatar).owner())
                .burnReputation(uint(reputation * (-1)), _proposal.beneficiary),
                "Failed to mint reputation"
            );
        }

        if (reputation != 0) {
            proposal.redeemedPeriods[0] = proposal.redeemedPeriods[0].add(periodsToPay);
            emit RedeemReputation(_proposalId, _proposal.beneficiary, reputation);
        }

        // restore proposal reward.
        proposal.reputationChange = _proposal.reputationChange;
    }

    /**
    * @dev RedeemNativeToken reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @return amount the redeemed nativeToken.
    */
    function redeemNativeToken(bytes32 _proposalId) public returns(uint amount) {
        ContributionProposal memory _proposal = organizationProposals[_proposalId];
        ContributionProposal storage proposal = organizationProposals[_proposalId];

        require(proposal.executionTime != 0, "proposal was not accepted");

        uint periodsToPay = getPeriodsToPay(_proposalId, 1);

        // set proposal rewards to zero to prevent reentrancy attack.
        proposal.nativeTokenReward = 0;

        amount = periodsToPay.mul(_proposal.nativeTokenReward);

        if (amount > 0) {
            require(
                ControllerInterface(Avatar(avatar).owner())
                .mintTokens(amount, _proposal.beneficiary),
                "Failed to mint tokens"
            );

            proposal.redeemedPeriods[1] = proposal.redeemedPeriods[1].add(periodsToPay);

            emit RedeemNativeToken(_proposalId, _proposal.beneficiary, amount);
        }

        // restore proposal reward.
        proposal.nativeTokenReward = _proposal.nativeTokenReward;
    }

    /**
    * @dev RedeemEther reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @return amount ether redeemed amount
    */
    function redeemEther(bytes32 _proposalId) public returns(uint amount) {
        ContributionProposal memory _proposal = organizationProposals[_proposalId];
        ContributionProposal storage proposal = organizationProposals[_proposalId];

        require(proposal.executionTime != 0, "proposal was not accepted");

        uint periodsToPay = getPeriodsToPay(_proposalId, 2);

        // set proposal rewards to zero to prevent reentrancy attack.
        proposal.ethReward = 0;
        amount = periodsToPay.mul(_proposal.ethReward);

        if (amount > 0) {
            require(
                ControllerInterface(Avatar(avatar).owner())
                .sendEther(amount, _proposal.beneficiary),
                "Failed to transfer Ether"
            );

            proposal.redeemedPeriods[2] = proposal.redeemedPeriods[2].add(periodsToPay);

            emit RedeemEther(_proposalId,_proposal.beneficiary,amount);
        }

        // restore proposal reward.
        proposal.ethReward = _proposal.ethReward;
    }

    /**
    * @dev RedeemNativeToken reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @return amount the external token redeemed amount
    */
    function redeemExternalToken(bytes32 _proposalId) public returns(uint amount) {
        ContributionProposal memory _proposal = organizationProposals[_proposalId];
        ContributionProposal storage proposal = organizationProposals[_proposalId];

        require(proposal.executionTime != 0, "proposal was not accepted");

        uint periodsToPay = getPeriodsToPay(_proposalId, 3);

        // set proposal rewards to zero to prevent reentrancy attack.
        proposal.externalTokenReward = 0;

        if (_proposal.externalToken != address(0) && _proposal.externalTokenReward > 0) {
            amount = periodsToPay.mul(_proposal.externalTokenReward);
            
            if (amount > 0) {
                require(
                    ControllerInterface(Avatar(avatar).owner())
                    .externalTokenTransfer(_proposal.externalToken, _proposal.beneficiary, amount),
                    "Failed to transfer external token"
                );

                proposal.redeemedPeriods[3] = _proposal.redeemedPeriods[3].add(periodsToPay);
                
                emit RedeemExternalToken(_proposalId, _proposal.beneficiary, amount);
            }
        }

        // restore proposal reward.
        proposal.externalTokenReward = _proposal.externalTokenReward;
    }

    /**
    * @dev redeem rewards for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @param _whatToRedeem whatToRedeem array:
    *         whatToRedeem[0] - reputation
    *         whatToRedeem[1] - nativeTokenReward
    *         whatToRedeem[2] - Ether
    *         whatToRedeem[3] - ExternalToken
    * @return  result boolean array for each redeem type.
    */
    function redeem(bytes32 _proposalId, bool[4] _whatToRedeem)
    public
    returns(
        int reputationReward,
        uint nativeTokenReward,
        uint etherReward,
        uint externalTokenReward
    )
    {
        if (_whatToRedeem[0]) {
            reputationReward = redeemReputation(_proposalId);
        }

        if (_whatToRedeem[1]) {
            nativeTokenReward = redeemNativeToken(_proposalId);
        }

        if (_whatToRedeem[2]) {
            etherReward = redeemEther(_proposalId);
        }

        if (_whatToRedeem[3]) {
            externalTokenReward = redeemExternalToken(_proposalId);
        }
    }

    /**
    * @dev getPeriodsToPay return the periods left to be paid for reputation,nativeToken,ether or externalToken.
    * The function ignore the reward amount to be paid (which can be zero).
    * @param _proposalId the ID of the voting in the voting machine
    * @param _redeemType - the type of the reward  :
    *         0 - reputation
    *         1 - nativeTokenReward
    *         2 - Ether
    *         3 - ExternalToken
    * @return  periods left to be paid.
    */
    function getPeriodsToPay(bytes32 _proposalId, uint _redeemType) public view returns(uint) {
        require(_redeemType <= 3, "should be in the redeemedPeriods range");
        
        ContributionProposal memory _proposal = organizationProposals[_proposalId];
        
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
    * @param _redeemType - the type of the reward:
    *         0 - reputation
    *         1 - nativeTokenReward
    *         2 - Ether
    *         3 - ExternalToken
    * @return redeemed period.
    */
    function getRedeemedPeriods(bytes32 _proposalId, uint _redeemType) public view returns(uint) {
        return organizationProposals[_proposalId].redeemedPeriods[_redeemType];
    }

    function getProposalEthReward(bytes32 _proposalId) public view returns(uint) {
        return organizationProposals[_proposalId].ethReward;
    }

    function getProposalExternalTokenReward(bytes32 _proposalId) public view returns(uint) {
        return organizationProposals[_proposalId].externalTokenReward;
    }

    function getProposalExternalToken(bytes32 _proposalId) public view returns(address) {
        return organizationProposals[_proposalId].externalToken;
    }

    function getProposalExecutionTime(bytes32 _proposalId) public view returns(uint) {
        return organizationProposals[_proposalId].executionTime;
    }
}
