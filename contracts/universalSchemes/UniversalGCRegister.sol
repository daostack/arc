pragma solidity ^0.4.11;

import "../controller/Controller.sol";
import "../VotingMachines/BoolVoteInterface.sol";
import "./UniversalScheme.sol";

/**
 * @title A schme to manage global constaintg for organizations
 * @dev The schme is used to register or remove new global constraints
 */

contract UniversalGCRegister is UniversalScheme {
    // The struct that holds the information of a global constraint proposed to be added or removed.
    struct gcProposal {
        address gc; // The address of the global contraint contract.
        bytes32 parametersHash; // Parameters for global constraint.
        uint proposalType; // 1: add a GC, 2: remove a GC.
        bytes32 removeParams; // Voting parameters for removing this GC.
    }

    // Struct holding the data for each organization
    struct Organization {
        bool isRegistered;
        bytes32 voteRegisterParams; // The voting parameters for adding a GC.
        BoolVoteInterface boolVote; // The voting machine in which the voting takes place.
        mapping(bytes32=>gcProposal) proposals; // A mapping from the proposal ID to the proposal itself.
        mapping(address=>bytes32) removeParams; // A mapping that saves the parameters for removing each GC.
    }

    // A mapping from thr organization (controller) address to the saved data of the organization:
    mapping(address=>Organization) organizations;

    // Constructor, updating the initial prarmeters:
    function UniversalGCRegister(StandardToken _nativeToken, uint _fee, address _beneficiary) {
        updateParameters(_nativeToken, _fee, _beneficiary, bytes32(0));
    }

    // The format of the hashing of the parameters:
    function parametersHash(bytes32 _voteRegisterParams,
                                BoolVoteInterface _boolVote)
                                constant returns(bytes32) {
      return (sha3(_voteRegisterParams, _boolVote));
    }

    // Check that the parameters listed match the ones in the controller:
    function checkParameterHashMatch(Controller _controller,
                     bytes32 _voteRegisterParams,
                     BoolVoteInterface _boolVote) constant returns(bool) {
       return (_controller.globalConstraintsSchemeParams() == parametersHash(_voteRegisterParams, _boolVote));
    }

    // Adding an organization to the universal scheme:
    function addOrUpdateOrg(Controller _controller,
                     bytes32 _voteRegisterParams,
                     BoolVoteInterface _boolVote) {

      // Pay fees for using scheme:
      nativeToken.transferFrom(msg.sender, beneficiary, fee);

      require(checkParameterHashMatch(_controller, _voteRegisterParams, _boolVote));
      Organization memory org;
      org.isRegistered = true;
      org.voteRegisterParams = _voteRegisterParams;
      org.boolVote = _boolVote;
      organizations[_controller] = org;
    }

    // Proposing to add a new GC:
    function proposeGC(Controller _controller, address _gc, bytes32 _parametersHash, bytes32 _removeParams) returns(bytes32) {
        Organization org = organizations[_controller];
        require(org.isRegistered); // Check org is registred to use this universal scheme.
        require(checkParameterHashMatch(_controller,
                      org.voteRegisterParams,
                      org.boolVote));
        BoolVoteInterface boolVote = org.boolVote;
        bytes32 id = boolVote.propose(org.voteRegisterParams);
        if (org.proposals[id].proposalType != 0) revert();
        org.proposals[id].proposalType = 1;
        org.proposals[id].gc = _gc;
        org.proposals[id].parametersHash = _parametersHash;
        org.proposals[id].removeParams = _removeParams;
        voteGC(_controller, id, true);
        return id;
    }

    // Proposing to remove a new GC:
    function proposeToRemoveGC(Controller _controller, address _gc) returns(bytes32) {
        Organization org = organizations[_controller];
        require(org.isRegistered); // Check org is registred to use this universal scheme.
        require(checkParameterHashMatch(_controller,
                      org.voteRegisterParams,
                      org.boolVote));
        BoolVoteInterface boolVote = org.boolVote;
        bytes32 id = boolVote.propose(org.removeParams[_gc]);
        if (org.proposals[id].proposalType != 0) revert();
        org.proposals[id].proposalType = 2;
        org.proposals[id].gc = _gc;
        voteGC(_controller, id, true);
        return id;
    }

    // Voting a GC, also handels the execuation when vote is over:
    function voteGC( Controller _controller, bytes32 id, bool _yes ) returns(bool) {
        BoolVoteInterface boolVote = organizations[_controller].boolVote;
        if( ! boolVote.vote(id, _yes, msg.sender) ) return false;
        if( boolVote.voteResults(id) ) {
            gcProposal memory proposal = organizations[_controller].proposals[id];
            if( ! boolVote.cancelProposal(id) ) revert();
            if( organizations[_controller].proposals[id].proposalType == 2 ) {
                if( ! _controller.removeGlobalConstraint(proposal.gc) ) revert();
            }
            if( organizations[_controller].proposals[id].proposalType == 1 ) {
                if( ! _controller.addGlobalConstraint(proposal.gc, proposal.parametersHash) ) revert();
            }
            organizations[_controller].proposals[id].proposalType = 0;
        }
    }

    // Check the status of a vote:
    function getVoteStatus(Controller _controller, bytes32 id) constant returns(uint[3]) {
        BoolVoteInterface boolVote = organizations[_controller].boolVote;
        return (boolVote.voteStatus(id));
    }
}
