pragma solidity ^0.5.17;

import "../votingMachines/VotingMachineCallbacks.sol";

/**
 * @title A scheme for proposing and rewarding contributions to an organization
 * @dev An agent can ask an organization to recognize a contribution and reward
 * him with token, reputation, ether or any combination.
 */
contract ContributionReward is
        VotingMachineCallbacks,
        ProposalExecuteInterface {
    using SafeMath for uint;

    event NewContributionProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        string _descriptionHash,
        int256 _reputationChange,
        uint[5]  _rewards,
        IERC20 _externalToken,
        address _beneficiary
    );

    event ProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId, int256 _param);

    event RedeemReputation(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _beneficiary,
        int256 _amount);

    event RedeemEther(address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _beneficiary,
        uint256 _amount);

    event RedeemNativeToken(address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _beneficiary,
        uint256 _amount);

    event RedeemExternalToken(address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _beneficiary,
        uint256 _amount);

    // A struct holding the data for a contribution proposal
    struct ContributionProposal {
        uint256 nativeTokenReward; // Reward asked in the native token of the organization.
        int256 reputationChange; // Organization reputation reward requested.
        uint256 ethReward;
        IERC20 externalToken;
        uint256 externalTokenReward;
        address payable beneficiary;
        uint256 periodLength;
        uint256 numberOfPeriods;
        uint256 executionTime;
        uint[4] redeemedPeriods;
    }

    mapping(bytes32=>ContributionProposal) public organizationProposals;

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
    initializer
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
    * @param _decision a parameter of the voting result, 1 yes and 2 is no.
    */
    function executeProposal(bytes32 _proposalId, int256 _decision)
    external
    onlyVotingMachine(_proposalId)
    returns(bool) {
        require(organizationProposals[_proposalId].executionTime == 0);
        require(organizationProposals[_proposalId].beneficiary != address(0));
        // Check if vote was successful:
        if (_decision == 1) {
          // solhint-disable-next-line not-rely-on-time
            organizationProposals[_proposalId].executionTime = now;
        }
        emit ProposalExecuted(address(avatar), _proposalId, _decision);
        return true;
    }

    /**
    * @dev Submit a proposal for a reward for a contribution:
    * @param _descriptionHash A hash of the proposal's description
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
        string memory _descriptionHash,
        int256 _reputationChange,
        uint[5] memory _rewards,
        IERC20 _externalToken,
        address payable _beneficiary
    )
    public
    returns(bytes32)
    {
        validateProposalParams(_reputationChange, _rewards);
        bytes32 proposalId = votingMachine.propose(2, msg.sender);
        address payable beneficiary = _beneficiary;
        if (beneficiary == address(0)) {
            beneficiary = msg.sender;
        }

        ContributionProposal memory proposal = ContributionProposal({
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
        organizationProposals[proposalId] = proposal;

        emit NewContributionProposal(
            address(avatar),
            proposalId,
            address(votingMachine),
            _descriptionHash,
            _reputationChange,
            _rewards,
            _externalToken,
            beneficiary
        );

        proposalsBlockNumber[proposalId] = block.number;
        return proposalId;
    }

    /**
    * @dev RedeemReputation reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @return reputation the redeemed reputation.
    */
    function redeemReputation(bytes32 _proposalId) public returns(int256 reputation) {

        ContributionProposal memory _proposal = organizationProposals[_proposalId];
        ContributionProposal storage proposal = organizationProposals[_proposalId];
        require(proposal.executionTime != 0, "proposal not executed yet");
        uint256 periodsToPay = getPeriodsToPay(_proposalId, 0);

        //set proposal reward to zero to prevent reentrancy attack.
        proposal.reputationChange = 0;
        reputation = int(periodsToPay) * _proposal.reputationChange;
        if (reputation > 0) {
            require(
            Controller(
            avatar.owner()).mintReputation(uint(reputation), _proposal.beneficiary));
        } else if (reputation < 0) {
            require(
            Controller(
            avatar.owner()).burnReputation(uint(reputation*(-1)), _proposal.beneficiary));
        }
        if (reputation != 0) {
            proposal.redeemedPeriods[0] = proposal.redeemedPeriods[0].add(periodsToPay);
            emit RedeemReputation(address(avatar), _proposalId, _proposal.beneficiary, reputation);
        }
        //restore proposal reward.
        proposal.reputationChange = _proposal.reputationChange;
    }

    /**
    * @dev RedeemNativeToken reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @return amount the redeemed nativeToken.
    */
    function redeemNativeToken(bytes32 _proposalId) public returns(uint256 amount) {

        ContributionProposal memory _proposal = organizationProposals[_proposalId];
        ContributionProposal storage proposal = organizationProposals[_proposalId];
        require(proposal.executionTime != 0, "proposal not executed yet");
        uint256 periodsToPay = getPeriodsToPay(_proposalId, 1);
        //set proposal rewards to zero to prevent reentrancy attack.
        proposal.nativeTokenReward = 0;

        amount = periodsToPay.mul(_proposal.nativeTokenReward);
        if (amount > 0) {
            require(Controller(avatar.owner()).mintTokens(amount, _proposal.beneficiary));
            proposal.redeemedPeriods[1] = proposal.redeemedPeriods[1].add(periodsToPay);
            emit RedeemNativeToken(address(avatar), _proposalId, _proposal.beneficiary, amount);
        }

        //restore proposal reward.
        proposal.nativeTokenReward = _proposal.nativeTokenReward;
    }

    /**
    * @dev RedeemEther reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @return amount ether redeemed amount
    */
    function redeemEther(bytes32 _proposalId) public returns(uint256 amount) {

        ContributionProposal memory _proposal = organizationProposals[_proposalId];
        ContributionProposal storage proposal = organizationProposals[_proposalId];
        require(proposal.executionTime != 0, "proposal not executed yet");
        uint256 periodsToPay = getPeriodsToPay(_proposalId, 2);
        //set proposal rewards to zero to prevent reentrancy attack.
        proposal.ethReward = 0;
        amount = periodsToPay.mul(_proposal.ethReward);

        if (amount > 0) {
            require(Controller(avatar.owner()).sendEther(amount, _proposal.beneficiary));
            proposal.redeemedPeriods[2] = proposal.redeemedPeriods[2].add(periodsToPay);
            emit RedeemEther(address(avatar), _proposalId, _proposal.beneficiary, amount);
        }

        //restore proposal reward.
        proposal.ethReward = _proposal.ethReward;
    }

    /**
    * @dev RedeemNativeToken reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @return amount the external token redeemed amount
    */
    function redeemExternalToken(bytes32 _proposalId) public returns(uint256 amount) {

        ContributionProposal memory _proposal = organizationProposals[_proposalId];
        ContributionProposal storage proposal = organizationProposals[_proposalId];
        require(proposal.executionTime != 0, "proposal not executed yet");
        uint256 periodsToPay = getPeriodsToPay(_proposalId, 3);
        //set proposal rewards to zero to prevent reentrancy attack.
        proposal.externalTokenReward = 0;

        if (proposal.externalToken != IERC20(0) && _proposal.externalTokenReward > 0) {
            amount = periodsToPay.mul(_proposal.externalTokenReward);
            if (amount > 0) {
                require(
                Controller(
                avatar.owner())
                .externalTokenTransfer(_proposal.externalToken, _proposal.beneficiary, amount));
                proposal.redeemedPeriods[3] = proposal.redeemedPeriods[3].add(periodsToPay);
                emit RedeemExternalToken(address(avatar), _proposalId, _proposal.beneficiary, amount);
            }
        }
        //restore proposal reward.
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
    function redeem(bytes32 _proposalId, bool[4] memory _whatToRedeem)
    public
    returns(int256 reputationReward, uint256 nativeTokenReward, uint256 etherReward, uint256 externalTokenReward)
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
    function getPeriodsToPay(bytes32 _proposalId, uint256 _redeemType) public view returns (uint256) {
        require(_redeemType <= 3, "should be in the redeemedPeriods range");
        ContributionProposal memory _proposal = organizationProposals[_proposalId];
        if (_proposal.executionTime == 0)
            return 0;
        uint256 periodsFromExecution;
        if (_proposal.periodLength > 0) {
          // solhint-disable-next-line not-rely-on-time
            periodsFromExecution = (now.sub(_proposal.executionTime))/(_proposal.periodLength);
        }
        uint256 periodsToPay;
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
    * @param _redeemType - the type of the reward  :
    *         0 - reputation
    *         1 - nativeTokenReward
    *         2 - Ether
    *         3 - ExternalToken
    * @return redeemed period.
    */
    function getRedeemedPeriods(bytes32 _proposalId, uint256 _redeemType)
    public
    view
    returns (uint256) {
        return organizationProposals[_proposalId].redeemedPeriods[_redeemType];
    }

    function getProposalEthReward(bytes32 _proposalId) public view returns (uint256) {
        return organizationProposals[_proposalId].ethReward;
    }

    function getProposalExternalTokenReward(bytes32 _proposalId) public view returns (uint256) {
        return organizationProposals[_proposalId].externalTokenReward;
    }

    function getProposalExternalToken(bytes32 _proposalId) public view returns (address) {
        return address(organizationProposals[_proposalId].externalToken);
    }

    function getProposalExecutionTime(bytes32 _proposalId) public view returns (uint256) {
        return organizationProposals[_proposalId].executionTime;
    }

    /**
    * @dev validateProposalParams validate proposal's rewards parameters.
    * The function check for potential overflow upon proposal's redeem.
    * The function reverts if the params are not valid.
    * @param _reputationChange - Amount of reputation change requested .Can be negative.
    * @param _rewards rewards array:
    *         rewards[0] - Amount of tokens requested per period
    *         rewards[1] - Amount of ETH requested per period
    *         rewards[2] - Amount of external tokens requested per period
    *         rewards[3] - Period length - if set to zero it allows immediate redeeming after execution.
    *         rewards[4] - Number of periods
    */
    function validateProposalParams(int256 _reputationChange, uint[5] memory _rewards) private pure {
        require(((_rewards[3] > 0) || (_rewards[4] == 1)), "periodLength equal 0 require numberOfPeriods to be 1");
        if (_rewards[4] > 0) {
            // This is the only case of overflow not detected by the check below
            require(!(int(_rewards[4]) == -1 && _reputationChange == (-2**255)),
            "numberOfPeriods * _reputationChange will overflow");
           //check that numberOfPeriods * _reputationChange will not overflow
            require((int(_rewards[4]) * _reputationChange) / int(_rewards[4]) == _reputationChange,
            "numberOfPeriods * reputationChange will overflow");
            //check that numberOfPeriods * tokenReward will not overflow
            require((_rewards[4] * _rewards[0]) / _rewards[4] == _rewards[0],
            "numberOfPeriods * tokenReward will overflow");
            //check that numberOfPeriods * ethReward will not overflow
            require((_rewards[4] * _rewards[1]) / _rewards[4] == _rewards[1],
            "numberOfPeriods * ethReward will overflow");
            //check that numberOfPeriods * texternalTokenReward will not overflow
            require((_rewards[4] * _rewards[2]) / _rewards[4] == _rewards[2],
            "numberOfPeriods * texternalTokenReward will overflow");
        }
    }

}
