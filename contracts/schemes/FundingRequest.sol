pragma solidity ^0.6.12;
// SPDX-License-Identifier: GPL-3.0

import "../votingMachines/VotingMachineCallbacks.sol";
import "../libs/StringUtil.sol";
import "./CommonInterface.sol";


/**
 * @title A scheme for requesting funding from an organization
 */
contract FundingRequest is
        VotingMachineCallbacks,
        ProposalExecuteInterface,
        CommonInterface {
    using SafeMath for uint;
    using StringUtil for string;

    event NewFundingProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address payable _beneficiary,
        uint256 _amount,
        string _descriptionHash
    );

    event ProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId, bool _decision);

    event Redeem(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _beneficiary,
        uint256 _amount
    );

    struct Proposal {
        address payable beneficiary;
        uint256 amount;
        string descriptionHash;
        uint256 executionTime;
    }

    mapping(bytes32=>Proposal) public proposals;

    IERC20 public fundingToken;

    /**
     * @dev initialize
     * @param _avatar the avatar this scheme referring to.
     * @param _votingMachine the voting machines address to
     * @param _votingParams genesisProtocol parameters - valid only if _voteParamsHash is zero
     * @param _voteOnBehalf genesisProtocol parameter - valid only if _voteParamsHash is zero
     * @param _voteParamsHash voting machine parameters.
     * @param _fundingToken token to transfer to funding requests. 0x0 address for the native coin
     */
    function initialize(
        Avatar _avatar,
        IntVoteInterface _votingMachine,
        uint256[11] calldata _votingParams,
        address _voteOnBehalf,
        bytes32 _voteParamsHash,
        IERC20 _fundingToken
    )
    external
    {
        super._initializeGovernance(_avatar, _votingMachine, _voteParamsHash, _votingParams, _voteOnBehalf);
        fundingToken = _fundingToken;
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _decision a parameter of the voting result, 1 yes and 2 is no.
    */
    function executeProposal(bytes32 _proposalId, int256 _decision)
    external
    onlyVotingMachine(_proposalId)
    override
    returns(bool) {
        require(proposals[_proposalId].executionTime == 0);
        require(proposals[_proposalId].beneficiary != address(0));
        // Check if vote was successful:
        if (_decision == 1) {
            // solhint-disable-next-line not-rely-on-time
            proposals[_proposalId].executionTime = now;
        }
        emit ProposalExecuted(address(avatar), _proposalId, _decision == 1);
        return true;
    }

    /**
    * @dev Submit a funding request:
    * @param _beneficiary Who gets the funding
    * @param _amount Funding amount requested
    * @param _descriptionHash A hash of the proposal's description
    */
    function propose(
        address payable _beneficiary,
        uint256 _amount,
        string memory _descriptionHash
    )
    public
    returns(bytes32)
    {
        require(
            avatar.db(FUNDED_BEFORE_DEADLINE_KEY).hashCompareWithLengthCheck(FUNDED_BEFORE_DEADLINE_VALUE),
            "funding is not allowed yet"
        );
        bytes32 proposalId = votingMachine.propose(2, voteParamsHash, msg.sender, address(avatar));
        address payable beneficiary = _beneficiary;
        if (beneficiary == address(0)) {
            beneficiary = msg.sender;
        }

        Proposal memory proposal = Proposal({
            beneficiary: beneficiary,
            amount: _amount,
            descriptionHash: _descriptionHash,
            executionTime: 0
        });
        proposals[proposalId] = proposal;

        emit NewFundingProposal(
            address(avatar),
            proposalId,
            beneficiary,
            _amount,
            _descriptionHash
        );

        proposalsBlockNumber[proposalId] = block.number;

        return proposalId;
    }

    /**
    * @dev Redeem proposal funding
    * @param _proposalId the ID of the voting in the voting machine
    */
    function redeem(bytes32 _proposalId) public {
        Proposal memory _proposal = proposals[_proposalId];
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.executionTime != 0, "proposal does not exist or not approved");
        proposal.executionTime = 0;
        if (fundingToken == IERC20(0)) {
            require(
                Controller(avatar.owner()).sendEther(_proposal.amount, _proposal.beneficiary),
                "failed to transfer network token from DAO"
            );
        } else {
            require(
                Controller(avatar.owner()).externalTokenTransfer(
                    fundingToken,
                    _proposal.beneficiary,
                    _proposal.amount
                ),
                "failed to transfer tokens from DAO"
            );
        }
        emit Redeem(address(avatar), _proposalId, _proposal.beneficiary, _proposal.amount);

        delete proposals[_proposalId];
    }
}
