pragma solidity ^0.4.24;

import "@daostack/infra/contracts/VotingMachines/IntVoteInterface.sol";
import "@daostack/infra/contracts/VotingMachines/GenesisProtocolCallbacksInterface.sol";
import "../VotingMachines/GenesisProtocolCallbacks.sol";


/**
 * @title GenericScheme.
 * @dev  A scheme for proposing and executing calls to an arbitrary function
 * on a specific contract on behalf of the organization avatar.
 */
contract GenericScheme is GenesisProtocolCallbacks, GenesisProtocolExecuteInterface {
    
    event NewCallProposal(bytes32 indexed _proposalId, bytes callData);
    event ProposalExecuted(bytes32 indexed _proposalId,int _param);
    event ProposalDeleted(bytes32 indexed _proposalId);

    // A mapping from the data hash to the saved data of the organization:
    mapping(bytes32 => bytes) public proposals;
    
    IntVoteInterface public intVote;
    bytes32 public voteParams;
    address public contractToCall;
    Avatar public avatar;

    modifier onlyApprovedParams() {
        bytes32 controllerParamsHash = ControllerInterface(avatar.owner()).getSchemeParameters(this);
        bytes32 paramsHash = getParametersHash(voteParams, intVote, contractToCall);

        require(controllerParamsHash == paramsHash, "Parameters entered were not authorized by the controller");
        _;
    }

    constructor () public {
        avatar = Avatar(0x000000000000000000000000000000000000dead);
    }

    function init(
        Avatar _avatar,
        IntVoteInterface _intVote,
        bytes32 _voteParams,
        address _contractToCall
    ) external
    {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");

        avatar = _avatar;
        voteParams = _voteParams;
        intVote = _intVote;
        contractToCall = _contractToCall;
    }
    
    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _param a parameter of the voting result, 1 yes and 2 is no.
    */
    function executeProposal(bytes32 _proposalId, int _param) external onlyApprovedParams onlyVotingMachine(_proposalId) returns(bool) {
        // Save proposal to memory and delete from storage:
        bytes memory proposal = proposals[_proposalId];

        require(proposal.length != 0, "must be a live proposal");

        delete proposals[_proposalId];

        emit ProposalDeleted(_proposalId);
        
        bool retVal = true;

        // If no decision do nothing:
        if (_param != 0) {
            // Define controller and get the params:
            ControllerInterface controller = ControllerInterface(Avatar(avatar).owner());
            
            if (controller.genericCall(
                     contractToCall,
                     proposal) == bytes32(0)) {
                retVal = false;
            }
        }
        
        emit ProposalExecuted(_proposalId, _param);

        return retVal;
    }

    /**
    * @dev propose to call on behalf of the _avatar
    *      The function trigger NewCallProposal event
    * @param _callData - The abi encode data for the call
    * @return an id which represents the proposal
    */
    function proposeCall(bytes _callData)
    public
    onlyApprovedParams
    returns(bytes32)
    {
        bytes32 proposalId = intVote.propose(2, voteParams, msg.sender);

        require(_callData.length != 0, "call data can't be empty");

        proposals[proposalId] = _callData;

        proposalsInfo[proposalId] = ProposalInfo({
            blockNumber: block.number,
            avatar: avatar,
            votingMachine: intVote
        });

        emit NewCallProposal(proposalId, _callData);

        return proposalId;
    }

    /**
    * @dev Hash the parameters, and return the hash value
    * @param _voteParams -  voting parameters
    * @param _intVote  - voting machine contract.
    * @return bytes32 -the parameters hash
    */
    function getParametersHash(
        bytes32 _voteParams,
        IntVoteInterface _intVote,
        address _contractToCall
    ) public pure returns(bytes32)
    {
        return keccak256(abi.encodePacked(_voteParams, _intVote, _contractToCall));
    }

}
