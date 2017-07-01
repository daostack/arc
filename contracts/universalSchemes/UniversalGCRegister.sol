pragma solidity ^0.4.11;

import "../controller/Controller.sol";
import "../VotingMachines/BoolVoteInterface.sol";
import "./UniversalScheme.sol";

contract UniversalGCRegister is UniversalScheme {
    struct gcProposal {
      address gc;
      bytes32 parametersHash;
      uint proposalType; // 1: add a GC, 2: remove a GC.
    }

    struct Organization {
      bool isRegistered;
      bytes32 voteRegisterParams;
      bytes32 voteRemoveParams;
      BoolVoteInterface boolVote;
      mapping(bytes32=>gcProposal) proposals;
      mapping(address=>bytes32) removeParams;
    }

    mapping(address=>Organization) organizations;

    function UniversalGCRegister(StandardToken _nativeToken, uint _fee, address _benificiary) {
      updateParameters(_nativeToken, _fee, _benificiary, bytes32(0));
    }

    function parametersHash(bytes32 _voteRegisterParams,
                                BoolVoteInterface _boolVote)
                                constant returns(bytes32) {
      return (sha3(_voteRegisterParams, _boolVote));
    }

    function checkParameterHashMatch(Controller _controller,
                     bytes32 _voteRegisterParams,
                     BoolVoteInterface _boolVote) constant returns(bool) {
       return (_controller.globalConstraintsSchemeParams() == parametersHash(_voteRegisterParams, _boolVote));
    }

    function addOrUpdateOrg(Controller _controller,
                     bytes32 _voteRegisterParams,
                     BoolVoteInterface _boolVote) {

      // Pay fees for using scheme:
      nativeToken.transferFrom(msg.sender, benificiary, fee);

      require(checkParameterHashMatch(_controller, _voteRegisterParams, _boolVote));
      /*Organization memory org;
      org.isRegistered = true;
      org.voteRegisterParams = _voteRegisterParams;
      org.boolVote = _boolVote;
      organizations[_controller] = org;*/
    }

    function proposeGC(Controller _controller, address _gc, bytes32 _parametersHash) returns(bytes32) {
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
        voteGC(_controller, id, true);
        return id;
    }

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

    function getVoteStatus(Controller _controller, bytes32 id) constant returns(uint[3]) {
        BoolVoteInterface boolVote = organizations[_controller].boolVote;
        return (boolVote.voteStatus(id));
    }
}
