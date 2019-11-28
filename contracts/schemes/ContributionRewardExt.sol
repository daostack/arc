pragma solidity ^0.5.11;

import "@daostack/infra/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "../votingMachines/VotingMachineCallbacks.sol";


/**
 * @title A scheme for proposing and rewarding contributions to an organization
 * @dev An agent can ask an organization to recognize a contribution and reward
 * him with token, reputation, ether or any combination.
 */
contract ContributionRewardExt is VotingMachineCallbacks, ProposalExecuteInterface {
    using SafeMath for uint;

    event NewContributionProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        string _descriptionHash,
        int256 _reputationChange,
        uint[3]  _rewards,
        IERC20 _externalToken,
        address _beneficiary,
        address _proposer
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
        uint256 executionTime;
        uint256 nativeTokenRewardLeft;
        uint256 reputationChangeLeft;
        uint256 ethRewardLeft;
        uint256 externalTokenRewardLeft;
    }

    modifier onlyRedeemer() {
        if (redeemer != address(0)) {
            require(msg.sender == redeemer, "only redeemer allowed to redeem");
        }
        _;
    }

    mapping(bytes32=>ContributionProposal) public organizationProposals;

    IntVoteInterface public votingMachine;
    bytes32 public voteParams;
    address public contractToCall;
    Avatar public avatar;
    address public redeemer;

    /**
     * @dev initialize
     * @param _avatar the avatar to mint reputation from
     * @param _votingMachine the voting machines address to
     * @param _voteParams voting machine parameters.
     * @param _redeemer an address which allowed to redeem the contribution.
       if _redeemer is 0 this param is agnored.
     */
    function initialize(
        Avatar _avatar,
        IntVoteInterface _votingMachine,
        bytes32 _voteParams,
        address _redeemer
    )
    external
    {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");
        avatar = _avatar;
        votingMachine = _votingMachine;
        voteParams = _voteParams;
        redeemer = _redeemer;
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
    * @param _externalToken Address of external token, if reward is requested there
    * @param _beneficiary Who gets the rewards. if equal to 0 the beneficiary will be msg.sender.
    * @param _proposer proposer . if equal to 0 the proposer will be msg.sender.
    */
    function proposeContributionReward(
        string memory _descriptionHash,
        int256 _reputationChange,
        uint[3] memory _rewards,
        IERC20 _externalToken,
        address payable _beneficiary,
        address _proposer
    )
    public
    returns(bytes32)
    {
        address proposer = _proposer;
        if (proposer == address(0)) {
            proposer = msg.sender;
        }
        bytes32 contributionId = votingMachine.propose(2, voteParams, proposer, address(avatar));
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
            executionTime: 0,
            nativeTokenRewardLeft: 0,
            reputationChangeLeft: 0,
            ethRewardLeft: 0,
            externalTokenRewardLeft: 0
        });
        organizationProposals[contributionId] = proposal;

        emit NewContributionProposal(
            address(avatar),
            contributionId,
            address(votingMachine),
            _descriptionHash,
            _reputationChange,
            _rewards,
            _externalToken,
            beneficiary,
            proposer
        );

        proposalsInfo[address(votingMachine)][contributionId] = ProposalInfo({
            blockNumber:block.number,
            avatar:avatar
        });
        return contributionId;
    }

    /**
    * @dev RedeemReputation reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @return reputation the redeemed reputation.
    */
    function redeemReputation(bytes32 _proposalId) public returns(int256 reputation) {
        ContributionProposal memory _proposal = organizationProposals[_proposalId];
        ContributionProposal storage proposal = organizationProposals[_proposalId];
        require(proposal.executionTime != 0);
        //set proposal reward to zero to prevent reentrancy attack.
        proposal.reputationChange = 0;

        if (_proposal.beneficiary == address(this)) {
            if (_proposal.reputationChange != 0) {
                if (_proposal.reputationChange > 0) {//for now only mint(not burn) rep allowed from ext contract.
                    proposal.reputationChangeLeft = uint256(_proposal.reputationChange);
                }
            }
        } else {
            reputation = _proposal.reputationChange;
        }

        if (reputation > 0) {
            require(
            Controller(
            avatar.owner()).mintReputation(uint(reputation), _proposal.beneficiary, address(avatar)));
        } else if (reputation < 0) {
            require(
            Controller(
            avatar.owner()).burnReputation(uint(reputation*(-1)), _proposal.beneficiary, address(avatar)));
        }
        if (reputation != 0) {
            emit RedeemReputation(address(avatar), _proposalId, _proposal.beneficiary, reputation);
        }
    }

    /**
    * @dev redeemReputationFromExtContract redeem reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @param _beneficiary the beneficiary to mint reputation to.
    * @param _reputation the reputation amount to mint
    */
    function redeemReputationFromExtContract(bytes32 _proposalId, address _beneficiary, uint256 _reputation)
    public
    onlyRedeemer
    {
        ContributionProposal storage proposal = organizationProposals[_proposalId];
        require(proposal.executionTime != 0);
        //this will ensure sum zero of reputation.
        proposal.reputationChangeLeft = proposal.reputationChangeLeft.sub(_reputation);
        require(
        Controller(
        avatar.owner()).mintReputation(_reputation, _beneficiary, address(avatar)));
        if (_reputation != 0) {
            emit RedeemReputation(address(avatar), _proposalId, _beneficiary, int256(_reputation));
        }
    }

    /**
    * @dev RedeemNativeToken reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @return amount the redeemed nativeToken.
    */
    function redeemNativeToken(bytes32 _proposalId) public returns(uint256 amount) {

        ContributionProposal memory _proposal = organizationProposals[_proposalId];
        ContributionProposal storage proposal = organizationProposals[_proposalId];
        require(proposal.executionTime != 0);
        //set proposal rewards to zero to prevent reentrancy attack.
        proposal.nativeTokenReward = 0;

        if (_proposal.beneficiary == address(this)) {
            if (_proposal.nativeTokenReward != 0) {
                proposal.nativeTokenRewardLeft = _proposal.nativeTokenReward;
            }
        }
        amount = _proposal.nativeTokenReward;
        if (amount > 0) {
            require(Controller(avatar.owner()).mintTokens(amount, _proposal.beneficiary, address(avatar)));
            emit RedeemNativeToken(address(avatar), _proposalId, _proposal.beneficiary, amount);
        }
    }

    /**
    * @dev redeemNativeTokenFromExtContract redeem reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @param _beneficiary the beneficiary to mint tokens to.
    * @param _amount the tokens amount to mint
    */
    function redeemNativeTokenFromExtContract(bytes32 _proposalId, address _beneficiary, uint256 _amount)
    public
    onlyRedeemer
    {
        ContributionProposal storage proposal = organizationProposals[_proposalId];
        require(proposal.executionTime != 0);
        //this will ensure sum zero of reputation.
        proposal.nativeTokenRewardLeft = proposal.nativeTokenRewardLeft.sub(_amount);

        if (_amount > 0) {
            require(Controller(avatar.owner()).mintTokens(_amount, _beneficiary, address(avatar)));
            emit RedeemNativeToken(address(avatar), _proposalId, _beneficiary, _amount);
        }
    }

    /**
    * @dev RedeemEther reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @return amount ether redeemed amount
    */
    function redeemEther(bytes32 _proposalId) public returns(uint256 amount) {
        ContributionProposal memory _proposal = organizationProposals[_proposalId];
        ContributionProposal storage proposal = organizationProposals[_proposalId];
        require(proposal.executionTime != 0);
        //set proposal rewards to zero to prevent reentrancy attack.
        proposal.ethReward = 0;
        if (_proposal.beneficiary == address(this)) {
            if (_proposal.ethReward != 0) {
                proposal.ethRewardLeft = _proposal.ethReward;
            }
        }
        amount = _proposal.ethReward;

        if (amount > 0) {
            require(Controller(avatar.owner()).sendEther(amount, _proposal.beneficiary, avatar));
            emit RedeemEther(address(avatar), _proposalId, _proposal.beneficiary, amount);
        }
    }

    /**
    * @dev redeemEtherFromExtContract redeem reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @param _beneficiary the beneficiary to send eth to.
    * @param _amount eth amount to send
    */
    function redeemEtherFromExtContract(bytes32 _proposalId, address payable _beneficiary, uint256 _amount)
    public
    onlyRedeemer
    {
        ContributionProposal storage proposal = organizationProposals[_proposalId];
        require(proposal.executionTime != 0);
        //this will ensure sum zero of reputation.
        proposal.ethRewardLeft = proposal.ethRewardLeft.sub(_amount);

        if (_amount > 0) {
            require(Controller(avatar.owner()).sendEther(_amount, _beneficiary, avatar));
            emit RedeemEther(address(avatar), _proposalId, _beneficiary, _amount);
        }
    }

    /**
    * @dev RedeemNativeToken reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @return amount the external token redeemed amount
    */
    function redeemExternalToken(bytes32 _proposalId) public returns(uint256 amount) {
        ContributionProposal memory _proposal = organizationProposals[_proposalId];
        ContributionProposal storage proposal = organizationProposals[_proposalId];
        require(proposal.executionTime != 0);
        //set proposal rewards to zero to prevent reentrancy attack.
        proposal.externalTokenReward = 0;

        if (_proposal.beneficiary == address(this)) {
            if (_proposal.externalTokenReward != 0) {
                proposal.externalTokenRewardLeft = _proposal.externalTokenReward;
            }
        }

        if (proposal.externalToken != IERC20(0) && _proposal.externalTokenReward > 0) {
            amount = _proposal.externalTokenReward;
            if (amount > 0) {
                require(
                Controller(
                avatar.owner())
                .externalTokenTransfer(_proposal.externalToken, _proposal.beneficiary, amount, avatar));
                emit RedeemExternalToken(address(avatar), _proposalId, _proposal.beneficiary, amount);
            }
        }
    }

    /**
    * @dev redeemExternalTokenFromExtContract redeem reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @param _beneficiary the beneficiary to send the external token to.
    * @param _amount the amount of external token to send
    */
    function redeemExternalTokenFromExtContract(bytes32 _proposalId, address _beneficiary, uint256 _amount)
    public
    onlyRedeemer {
        ContributionProposal storage proposal = organizationProposals[_proposalId];
        require(proposal.executionTime != 0);
        //this will ensure sum zero of reputation.
        proposal.externalTokenRewardLeft = proposal.externalTokenRewardLeft.sub(_amount);

        if (proposal.externalToken != IERC20(0)) {
            if (_amount > 0) {
                require(
                Controller(
                avatar.owner())
                .externalTokenTransfer(proposal.externalToken, _beneficiary, _amount, avatar));
                emit RedeemExternalToken(address(avatar), _proposalId, _beneficiary, _amount);
            }
        }
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

}
