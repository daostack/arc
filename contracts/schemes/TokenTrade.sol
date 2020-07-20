pragma solidity ^0.6.10;
// SPDX-License-Identifier: GPL-3.0

import "../votingMachines/VotingMachineCallbacks.sol";


/**
 * @title A scheme for join in a dao.
 * - A member can be proposed to join in by sending a min amount of fee.
 * - A member can ask to quite (RageQuit) a dao on any time.
 * - A member can donate to a dao.
 */
contract TokenTrade is VotingMachineCallbacks, ProposalExecuteInterface {
    using SafeMath for uint;
    using SafeERC20 for IERC20;

    event TokenTradeProposed(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        string _descriptionHash,
        address indexed _beneficiary,
        IERC20 _sendToken,
        uint256 _sendTokenAmount,
        IERC20 _receiveToken,
        uint256 _receiveTokenAmount
    );

    event TokenTradeProposalExecuted(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _beneficiary,
        IERC20 _sendToken,
        uint256 _sendTokenAmount,
        IERC20 _receiveToken,
        uint256 _receiveTokenAmount
    );

    event ProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId, int256 _decision);

    struct Proposal {
        address beneficiary;
        IERC20 sendToken;
        uint256 sendTokenAmount;
        IERC20 receiveToken;
        uint256 receiveTokenAmount;
        bool exist;
        bool passed;
    }

    mapping(bytes32=>Proposal) public proposals;

    /**
     * @dev initialize
     * @param _avatar the avatar this scheme referring to.
     * @param _votingMachine the voting machines address to
     * @param _votingParams genesisProtocol parameters - valid only if _voteParamsHash is zero
     * @param _voteOnBehalf genesisProtocol parameter - valid only if _voteParamsHash is zero
     * @param _voteParamsHash voting machine parameters.
     */
    function initialize(
        Avatar _avatar,
        IntVoteInterface _votingMachine,
        uint256[11] calldata _votingParams,
        address _voteOnBehalf,
        bytes32 _voteParamsHash
    )
    external
    {
        super._initializeGovernance(_avatar, _votingMachine, _voteParamsHash, _votingParams, _voteOnBehalf);
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _decision a parameter of the voting result, 1 yes and 2 is no.
    * @return bool success
    */
    function executeProposal(bytes32 _proposalId, int256 _decision)
    external
    onlyVotingMachine(_proposalId)
    override
    returns(bool) {
        Proposal memory proposal = proposals[_proposalId];
        if (_decision == 1) {
            proposals[_proposalId].passed = true;
            execute(_proposalId);
        } else {
            delete proposals[_proposalId];
            proposal.sendToken.safeTransfer(address(proposal.beneficiary), proposal.sendTokenAmount);
        }

        emit ProposalExecuted(address(avatar), _proposalId, _decision);
        return true;
    }


    function execute(bytes32 _proposalId) public returns(bool) {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.exist, "must be a live proposal");
        require(proposal.passed, "proposal must passed by voting machine");
        if (proposal.receiveToken.balanceOf(address(avatar)) >= proposal.receiveTokenAmount) {
            proposal.exist = false;
            proposal.sendToken.safeTransfer(address(avatar), proposal.sendTokenAmount);
            require(
                Controller(avatar.owner()).externalTokenTransfer(
                    proposal.receiveToken, proposal.beneficiary, proposal.receiveTokenAmount
                ), "failed to transfer tokens from the DAO"
            );

            emit TokenTradeProposalExecuted(
                address(avatar),
                _proposalId,
                proposal.beneficiary,
                proposal.sendToken,
                proposal.sendTokenAmount,
                proposal.receiveToken,
                proposal.receiveTokenAmount
            );
            delete proposals[_proposalId];
            return true;
        }
        return false;
    }

    /**
    * @dev propose to trade tokens with the DAO
    * @param _sendToken token the proposer suggests to send to the DAO
    * @param _sendTokenAmount token amount the proposer suggests to send to the DAO
    * @param _receiveToken token the proposer asks to receive from the DAO
    * @param _receiveTokenAmount token amount the proposer asks to receive from the DAO
    * @param _descriptionHash proposal description hash
    * @return an id which represents the proposal
    */
    function proposeTokenTrade(
        IERC20 _sendToken,
        uint256 _sendTokenAmount,
        IERC20 _receiveToken,
        uint256 _receiveTokenAmount,
        string memory _descriptionHash
    )
    public
    returns(bytes32)
    {
        require(
            address(_sendToken) != address(0) && address(_receiveToken) != address(0),
            "Token address must not be null"
        );
        require(_sendTokenAmount > 0 && _receiveTokenAmount > 0, "Token amount must be greater than 0");

        _sendToken.safeTransferFrom(msg.sender, address(this), _sendTokenAmount);
        bytes32 proposalId = votingMachine.propose(2, voteParamsHash, msg.sender, address(avatar));

        proposals[proposalId] = Proposal({
            beneficiary: msg.sender,
            sendToken: _sendToken,
            sendTokenAmount: _sendTokenAmount,
            receiveToken: _receiveToken,
            receiveTokenAmount: _receiveTokenAmount,
            exist: true,
            passed: false
        });

        proposalsBlockNumber[proposalId] = block.number;

        emit TokenTradeProposed(
            address(avatar),
            proposalId,
            _descriptionHash,
            msg.sender,
            _sendToken,
            _sendTokenAmount,
            _receiveToken,
            _receiveTokenAmount
        );

        return proposalId;
    }
}
