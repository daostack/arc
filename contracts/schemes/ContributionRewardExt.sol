pragma solidity 0.5.13;

import "@daostack/infra/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "../votingMachines/VotingMachineCallbacks.sol";
import "../libs/SafeERC20.sol";


/**
 * @title A scheme for proposing and rewarding contributions to an organization
 * @dev An agent can ask an organization to recognize a contribution and reward
 * him with token, reputation, ether or any combination.
 * This scheme extend the functionality of the ContributionReward scheme.
 * It enable to assign a rewarder, which, after the contributionreward has been accepted,
 * can then later distribute the assets as it would like.
 */
contract ContributionRewardExt is VotingMachineCallbacks, ProposalExecuteInterface {
    using SafeMath for uint;
    using SafeERC20 for address;

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
        uint256 nativeTokenRewardLeft;
        uint256 reputationChangeLeft;
        uint256 ethRewardLeft;
        uint256 externalTokenRewardLeft;
        bool acceptedByVotingMachine;
    }

    modifier onlyRewarder() {
        require(msg.sender == rewarder, "msg.sender is not authorized");
        _;
    }

    mapping(bytes32=>ContributionProposal) public organizationProposals;

    IntVoteInterface public votingMachine;
    bytes32 public voteParams;
    Avatar public avatar;
    address public rewarder;

    /**
    * @dev enables this contract to receive ethers
    */
    function() external payable {
    }

    /**
     * @dev initialize
     * @param _avatar the avatar to mint reputation from
     * @param _votingMachine the voting machines address
     * @param _voteParams voting machine parameters
     * @param _rewarder an address which allowed to redeem the contribution.
       if _rewarder is 0 this param is agnored.
     */
    function initialize(
        Avatar _avatar,
        IntVoteInterface _votingMachine,
        bytes32 _voteParams,
        address _rewarder
    )
    external
    {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");
        require(_votingMachine != IntVoteInterface(0), "votingMachine cannot be zero");
        avatar = _avatar;
        votingMachine = _votingMachine;
        voteParams = _voteParams;
        rewarder = _rewarder;
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the proposal in the voting machine
    * @param _decision a parameter of the voting result, 1 yes and 2 is no.
    */
    function executeProposal(bytes32 _proposalId, int256 _decision)
    external
    onlyVotingMachine(_proposalId)
    returns(bool) {
        require(organizationProposals[_proposalId].acceptedByVotingMachine == false);
        require(organizationProposals[_proposalId].beneficiary != address(0));
        if (_decision == 1) {
            organizationProposals[_proposalId].acceptedByVotingMachine = true;
        }
        emit ProposalExecuted(address(avatar), _proposalId, _decision);
        return true;
    }

    /**
    * @dev Submit a proposal for a reward for a contribution:
    * @param _descriptionHash A hash of the proposal's description
    * @param _reputationChange - Amount of reputation change requested .Can be negative.
    * @param _rewards rewards array:
    *         rewards[0] - Amount of tokens requested
    *         rewards[1] - Amount of ETH requested
    *         rewards[2] - Amount of external tokens
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
    returns(bytes32 proposalId)
    {
        address proposer = _proposer;
        if (proposer == address(0)) {
            proposer = msg.sender;
        }
        proposalId = votingMachine.propose(2, voteParams, proposer, address(avatar));
        address payable beneficiary = _beneficiary;
        if (beneficiary == address(0)) {
            beneficiary = msg.sender;
        }
        if (beneficiary == address(this)) {
            require(_reputationChange > 0, "only positive rep change(minting) allowed for this case");
        }

        ContributionProposal memory proposal = ContributionProposal({
            nativeTokenReward: _rewards[0],
            reputationChange: _reputationChange,
            ethReward: _rewards[1],
            externalToken: _externalToken,
            externalTokenReward: _rewards[2],
            beneficiary: beneficiary,
            nativeTokenRewardLeft: 0,
            reputationChangeLeft: 0,
            ethRewardLeft: 0,
            externalTokenRewardLeft: 0,
            acceptedByVotingMachine: false
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
            beneficiary,
            proposer
        );

        proposalsInfo[address(votingMachine)][proposalId] = ProposalInfo({
            blockNumber:block.number,
            avatar:avatar
        });
    }

    /**
    * @dev RedeemReputation reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @return reputation the redeemed reputation.
    */
    function redeemReputation(bytes32 _proposalId) public returns(int256 reputation) {
        ContributionProposal storage proposal = organizationProposals[_proposalId];
        require(proposal.acceptedByVotingMachine, "proposal was not accepted by the voting machine");

        //if the beneficiary is the current contract, we are not minting the rep to it
        //but instead refer to a mechanism in which the rep can be minted by the current contract
        //per request of the rewarder
        if (proposal.beneficiary == address(this)) {
            if (proposal.reputationChangeLeft == 0) {//for now only mint(not burn) rep allowed from ext contract.
                proposal.reputationChangeLeft = uint256(proposal.reputationChange);
                proposal.reputationChange = 0;
            }
        } else {
            reputation = proposal.reputationChange;
            //set proposal reward to zero to prevent reentrancy attack.
            proposal.reputationChange = 0;

            if (reputation > 0) {
                require(
                Controller(
                avatar.owner()).mintReputation(uint(reputation), proposal.beneficiary, address(avatar)));
            } else if (reputation < 0) {
                require(
                Controller(
                avatar.owner()).burnReputation(uint(reputation*(-1)), proposal.beneficiary, address(avatar)));
            }
            if (reputation != 0) {
                emit RedeemReputation(address(avatar), _proposalId, proposal.beneficiary, reputation);
            }
        }
    }

    /**
    * @dev RedeemNativeToken reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @return amount the redeemed nativeToken.
    */
    function redeemNativeToken(bytes32 _proposalId) public returns(uint256 amount) {

        ContributionProposal storage proposal = organizationProposals[_proposalId];
        require(proposal.acceptedByVotingMachine, "proposal was not accepted by the voting machine");

        if (proposal.beneficiary == address(this)) {
            //ensure nativeTokenRewardLeft can be set only one time
            if (proposal.nativeTokenRewardLeft == 0) {
                proposal.nativeTokenRewardLeft = proposal.nativeTokenReward;
            }
        }
        amount = proposal.nativeTokenReward;
        //set proposal rewards to zero to prevent reentrancy attack.
        proposal.nativeTokenReward = 0;
        if (amount > 0) {
            require(Controller(avatar.owner()).mintTokens(amount, proposal.beneficiary, address(avatar)));
            emit RedeemNativeToken(address(avatar), _proposalId, proposal.beneficiary, amount);
        }
    }

    /**
    * @dev RedeemEther reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @return amount ether redeemed amount
    */
    function redeemEther(bytes32 _proposalId) public returns(uint256 amount) {
        ContributionProposal storage proposal = organizationProposals[_proposalId];
        require(proposal.acceptedByVotingMachine, "proposal was not accepted by the voting machine");

        if (proposal.beneficiary == address(this)) {
            if (proposal.ethRewardLeft == 0) {
                proposal.ethRewardLeft = proposal.ethReward;
            }
        }
        amount = proposal.ethReward;
        //set proposal rewards to zero to prevent reentrancy attack.
        proposal.ethReward = 0;
        if (amount > 0) {
            require(Controller(avatar.owner()).sendEther(amount, proposal.beneficiary, avatar));
            emit RedeemEther(address(avatar), _proposalId, proposal.beneficiary, amount);
        }
    }

    /**
    * @dev RedeemNativeToken reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @return amount the external token redeemed amount
    */
    function redeemExternalToken(bytes32 _proposalId) public returns(uint256 amount) {
        ContributionProposal storage proposal = organizationProposals[_proposalId];
        require(proposal.acceptedByVotingMachine, "proposal was not accepted by the voting machine");


        if (proposal.beneficiary == address(this)) {
            if (proposal.externalTokenRewardLeft == 0) {
                proposal.externalTokenRewardLeft = proposal.externalTokenReward;
            }
        }

        if (proposal.externalToken != IERC20(0) && proposal.externalTokenReward > 0) {
            amount = proposal.externalTokenReward;
            //set proposal rewards to zero to prevent reentrancy attack.
            proposal.externalTokenReward = 0;
            require(
            Controller(
            avatar.owner())
            .externalTokenTransfer(proposal.externalToken, proposal.beneficiary, amount, avatar));
            emit RedeemExternalToken(address(avatar), _proposalId, proposal.beneficiary, amount);
        }
    }

    /**
    * @dev redeemReputationByRewarder redeem reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @param _beneficiary the beneficiary to mint reputation to.
    * @param _reputation the reputation amount to mint
    *        note: burn reputation is not supported via this function
    */
    function redeemReputationByRewarder(bytes32 _proposalId, address _beneficiary, uint256 _reputation)
    public
    onlyRewarder
    {
        ContributionProposal storage proposal = organizationProposals[_proposalId];
        require(proposal.acceptedByVotingMachine, "proposal was not accepted by the voting machine");
        //this will ensure sum zero of reputation
        //and that there was a privious call to redeemReputation function.
        proposal.reputationChangeLeft =
        proposal.reputationChangeLeft.sub(_reputation,
        "cannot redeem more reputation than allocated for this proposal or no redeemReputation was called");
        require(
        Controller(
        avatar.owner()).mintReputation(_reputation, _beneficiary, address(avatar)));
        if (_reputation != 0) {
            emit RedeemReputation(address(avatar), _proposalId, _beneficiary, int256(_reputation));
        }
    }

    /**
    * @dev redeemNativeTokenByRewarder redeem reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @param _beneficiary the beneficiary to mint tokens to.
    * @param _amount the tokens amount to mint
    */
    function redeemNativeTokenByRewarder(bytes32 _proposalId, address _beneficiary, uint256 _amount)
    public
    onlyRewarder
    {
        ContributionProposal storage proposal = organizationProposals[_proposalId];
        require(proposal.acceptedByVotingMachine, "proposal was not accepted by the voting machine");
        //this will ensure sum zero of reputation
        //and that there was a privious call to redeemNativeToken function.
        proposal.nativeTokenRewardLeft =
        proposal.nativeTokenRewardLeft.sub(_amount,
        "cannot redeem more tokens than allocated for this proposal or no redeemNativeToken was called");

        if (_amount > 0) {
            address(avatar.nativeToken()).safeTransfer(_beneficiary, _amount);
            emit RedeemNativeToken(address(avatar), _proposalId, _beneficiary, _amount);
        }
    }

    /**
    * @dev redeemEtherByRewarder redeem reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @param _beneficiary the beneficiary to send eth to.
    * @param _amount eth amount to send
    */
    function redeemEtherByRewarder(bytes32 _proposalId, address payable _beneficiary, uint256 _amount)
    public
    onlyRewarder
    {
        ContributionProposal storage proposal = organizationProposals[_proposalId];
        require(proposal.acceptedByVotingMachine, "proposal was not accepted by the voting machine");
        //this will ensure sum zero of reputation.
        //and that there was a privious call to redeemEther function.
        proposal.ethRewardLeft = proposal.ethRewardLeft.sub(_amount,
        "cannot redeem more Ether than allocated for this proposal or no redeemEther was called");

        if (_amount > 0) {
            _beneficiary.transfer(_amount);
            emit RedeemEther(address(avatar), _proposalId, _beneficiary, _amount);
        }
    }

    /**
    * @dev redeemExternalTokenByRewarder redeem reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @param _beneficiary the beneficiary to send the external token to.
    * @param _amount the amount of external token to send
    */
    function redeemExternalTokenByRewarder(bytes32 _proposalId, address _beneficiary, uint256 _amount)
    public
    onlyRewarder {
        ContributionProposal storage proposal = organizationProposals[_proposalId];
        require(proposal.acceptedByVotingMachine, "proposal was not accepted by the voting machine");
        //this will ensure sum zero of reputation.
        //and that there was a privious call to redeemExternalToken function.
        proposal.externalTokenRewardLeft =
        proposal.externalTokenRewardLeft.sub(_amount,
        "cannot redeem more tokens than allocated for this proposal or no redeemExternalToken was called");

        if (proposal.externalToken != IERC20(0)) {
            if (_amount > 0) {
                address(proposal.externalToken).safeTransfer(_beneficiary, _amount);
                emit RedeemExternalToken(address(avatar), _proposalId, _beneficiary, _amount);
            }
        }
    }

    /**
    * @dev redeem rewards for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @param _whatToRedeem whatToRedeem array of boolean values:
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

    function getProposalReputationReward(bytes32 _proposalId) public view returns (int256) {
        return organizationProposals[_proposalId].reputationChange;
    }

    function getProposalNativeTokenReward(bytes32 _proposalId) public view returns (uint256) {
        return organizationProposals[_proposalId].nativeTokenReward;
    }

    function getProposalAcceptedByVotingMachine(bytes32 _proposalId) public view returns (bool) {
        return organizationProposals[_proposalId].acceptedByVotingMachine;
    }

}
