pragma solidity ^0.5.17;

import "@daostack/infra-experimental/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra-experimental/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "../votingMachines/VotingMachineCallbacks.sol";
import "../controller/Avatar.sol";


/**
 * @title A scheme for proposing a signal on behalkf of the dao
 */
contract SignalScheme is VotingMachineCallbacks, ProposalExecuteInterface {

    event NewSignalProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        uint256 indexed _signalType,
        string _descriptionHash
    );

    event Signal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        uint256 indexed _signalType,
        string _descriptionHash
    );

    struct Proposal {
        string descriptionHash;
        bool executed;
    }

    struct Parameters {
        bytes32 voteApproveParams;
        IntVoteInterface intVote;
        uint256 signalType;
        Avatar avatar;
    }

    mapping(bytes32  =>  Proposal) public proposals;

    Parameters public params;

    /**
     * @dev initialize
     * @param  _avatar the scheme avatar
     * @param _signalType - signal types
     * @param _voteApproveParams voting machine params
     * @param _votingMachine  voting machine address
     * @param _votingParams genesisProtocol parameters - valid only if _voteParamsHash is zero
     * @param _voteOnBehalf genesisProtocol parameter - valid only if _voteParamsHash is zero
     */
    function initialize(Avatar _avatar,
                        uint256 _signalType,
                        bytes32 _voteApproveParams,
                        IntVoteInterface _votingMachine,
                        uint256[11] calldata _votingParams,
                        address _voteOnBehalf)
    external
    initializer {
        bytes32 voteParamsHash;
        if (_voteApproveParams == bytes32(0)) {
            //genesisProtocol
            GenesisProtocol genesisProtocol = GenesisProtocol(address(_votingMachine));
            voteParamsHash = genesisProtocol.getParametersHash(_votingParams, _voteOnBehalf);
            (uint256 queuedVoteRequiredPercentage, , , , , , , , , , , ,) =
            genesisProtocol.parameters(voteParamsHash);
            if (queuedVoteRequiredPercentage == 0) {
               //params not set already
                genesisProtocol.setParameters(_votingParams, _voteOnBehalf);
            }
        } else {
            //for other voting machines
            voteParamsHash = _voteApproveParams;
        }
        super._initialize(_avatar, _votingMachine, voteParamsHash);
        params = Parameters({
            voteApproveParams: voteParamsHash,
            signalType: _signalType,
            intVote: _votingMachine,
            avatar: _avatar
        });
    }

    /**
    * @dev Submit a proposal for a dao signal
    * @param _descriptionHash A hash of the proposal's description
    */
    function proposeSignal(
        string calldata _descriptionHash
    )
    external
    returns(bytes32)
    {
        require(Controller(params.avatar.owner()).isSchemeRegistered(address(this)),
        "scheme is not registered");

        bytes32 proposalId = params.intVote.propose(
        2,
        params.voteApproveParams,
        msg.sender,
        address(params.avatar)
        );

        proposals[proposalId].descriptionHash = _descriptionHash;

        emit NewSignalProposal(
            address(params.avatar),
            proposalId,
            params.signalType,
            _descriptionHash
        );

        proposalsBlockNumber[proposalId] = block.number;
        return proposalId;
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _param a parameter of the voting result, 1 yes and 2 is no.
    */
    function executeProposal(bytes32 _proposalId, int256 _param) external onlyVotingMachine(_proposalId) returns(bool) {
        require(!proposals[_proposalId].executed);
        proposals[_proposalId].executed = true;
        // Check if vote was successful:
        if (_param == 1) {
            emit Signal(address(params.avatar),
                        _proposalId,
                        params.signalType,
                        proposals[_proposalId].descriptionHash);
        }
        return true;
    }
}
