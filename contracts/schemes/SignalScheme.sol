pragma solidity 0.5.13;

import "@daostack/infra/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "../votingMachines/VotingMachineCallbacks.sol";
import "../controller/Avatar.sol";


/**
 * @title A scheme for proposing a signal on behalkf of the daoCreator
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
     * @param _intVote  voting machine address
     */
    function initialize(Avatar _avatar,
                        uint256 _signalType,
                        bytes32 _voteApproveParams,
                        IntVoteInterface _intVote)
    external {
        require(params.avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");
        params = Parameters({
            voteApproveParams: _voteApproveParams,
            signalType: _signalType,
            intVote: _intVote,
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
        require(Controller(params.avatar.owner()).isSchemeRegistered(address(this), address(params.avatar)),
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

        proposalsInfo[address(params.intVote)][proposalId] = ProposalInfo({
            blockNumber:block.number,
            avatar:params.avatar
        });
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
