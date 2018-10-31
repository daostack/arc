pragma solidity ^0.4.25;

import "@daostack/infra/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "./UniversalScheme.sol";
import "../votingMachines/VotingMachineCallbacks.sol";


/**
 * @title GenericScheme.
 * @dev  A scheme for proposing and executing calls to an arbitrary function
 * on a specific contract on behalf of the organization avatar.
 */
contract GenericScheme is UniversalScheme,VotingMachineCallbacks,ProposalExecuteInterface {
    event NewCallProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        bytes   callData
    );
    event ProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId,int _param);
    event ProposalDeleted(address indexed _avatar, bytes32 indexed _proposalId);

    // Details of a voting proposal:
    struct CallProposal {
        bytes callData;
        bool exist;
    }

    // A mapping from the organization (Avatar) address to the saved data of the organization:
    mapping(address=>mapping(bytes32=>CallProposal)) public organizationsProposals;


    struct Parameters {
        IntVoteInterface intVote;
        bytes32 voteParams;
        address contractToCall;
    }

    // A mapping from hashes to parameters (use to store a particular configuration on the controller)
    mapping(bytes32=>Parameters) public parameters;

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _param a parameter of the voting result, 1 yes and 2 is no.
    */
    function executeProposal(bytes32 _proposalId,int _param) external onlyVotingMachine(_proposalId) returns(bool) {
        address avatar = proposalsInfo[_proposalId].avatar;
        Parameters memory params = parameters[getParametersFromController(Avatar(avatar))];
        // Save proposal to memory and delete from storage:
        CallProposal memory proposal = organizationsProposals[avatar][_proposalId];
        require(proposal.exist,"must be a live proposal");
        delete organizationsProposals[avatar][_proposalId];
        emit ProposalDeleted(avatar, _proposalId);
        bool retVal = true;
        // If no decision do nothing:
        if (_param != 0) {
        // Define controller and get the params:
            ControllerInterface controller = ControllerInterface(Avatar(avatar).owner());
            if (controller.genericCall(
                     params.contractToCall,
                     proposal.callData,
                     avatar) == bytes32(0)) {
                retVal = false;
            }
          }
        emit ProposalExecuted(avatar, _proposalId,_param);
        return retVal;
    }

    /**
    * @dev Hash the parameters, save them if necessary, and return the hash value
    * @param _voteParams -  voting parameters
    * @param _intVote  - voting machine contract.
    * @return bytes32 -the parameters hash
    */
    function setParameters(
        bytes32 _voteParams,
        IntVoteInterface _intVote,
        address _contractToCall
    ) public returns(bytes32)
    {
        bytes32 paramsHash = getParametersHash(_voteParams, _intVote,_contractToCall);
        parameters[paramsHash].voteParams = _voteParams;
        parameters[paramsHash].intVote = _intVote;
        parameters[paramsHash].contractToCall = _contractToCall;
        return paramsHash;
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
        return keccak256(abi.encodePacked(_voteParams, _intVote,_contractToCall));
    }

    /**
    * @dev propose to call on behalf of the _avatar
    *      The function trigger NewCallProposal event
    * @param _callData - The abi encode data for the call
    * @param _avatar avatar of the organization
    * @return an id which represents the proposal
    */
    function proposeCall(Avatar _avatar, bytes _callData)
    public
    returns(bytes32)
    {
        Parameters memory params = parameters[getParametersFromController(_avatar)];
        IntVoteInterface intVote = params.intVote;

        bytes32 proposalId = intVote.propose(2, params.voteParams,msg.sender,_avatar);

        organizationsProposals[_avatar][proposalId] = CallProposal({
            callData: _callData,
            exist: true
        });
        proposalsInfo[proposalId] = ProposalInfo(
            {blockNumber:block.number,
            avatar:_avatar,
            votingMachine:params.intVote});
        emit NewCallProposal(_avatar,proposalId,_callData);
        return proposalId;
    }

    /**
    * @dev getContractToCall return the contract this scheme is calling
    * @param _avatar address of the organization's avatar
    * @return address the address of the contract this scheme is calling to
    * on behalf of the avatar
    */
    function getContractToCall(address _avatar) public view returns(address) {
        return parameters[getParametersFromController(Avatar(_avatar))].contractToCall;
    }

}
