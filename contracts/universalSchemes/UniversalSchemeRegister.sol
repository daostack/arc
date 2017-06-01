pragma solidity ^0.4.11;

import "../controller/Controller.sol";
import "../VotingMachines/BoolVoteInterface.sol";
import "./UniversalScheme.sol";

contract UniversalSchemeRegister is UniversalScheme {
    struct SchemeProposal {
      address scheme;
      bytes32 parametersHash;
      uint proposalType; // 1: add a schme, 2: remove a scheme.
      bool isRegistering;
    }

    struct Organization {
      bool isRegistered;
      bytes32 voteRegisterParams;
      bytes32 voteRemoveParams;
      BoolVoteInterface boolVote;
      mapping(bytes32=>SchemeProposal) proposals;
    }

    mapping(address=>Organization) organizations;

    function UniversalSchemeRegister(StandardToken _nativeToken, uint _fee, address _benificiary) {
      updateParameters(_nativeToken, _fee, _benificiary, bytes32(0));
    }

    function parametersHash(bytes32 _voteRegisterParams,
                                bytes32 _voteRemoveParams,
                                BoolVoteInterface _boolVote)
                                constant returns(bytes32) {
      return (sha3(_voteRegisterParams, _voteRemoveParams, _boolVote));
    }

    function checkParameterHashMatch(Controller _controller,
                     bytes32 _voteRegisterParams,
                     bytes32 _voteRemoveParams,
                     BoolVoteInterface _boolVote) constant returns(bool) {
       return (_controller.getSchemeParameters(this) == parametersHash(_voteRegisterParams,_voteRemoveParams,_boolVote));
    }

    function addOrUpdateOrg(Controller _controller,
                     bytes32 _voteRegisterParams,
                     bytes32 _voteRemoveParams,
                     BoolVoteInterface _boolVote) {

      // Pay fees for using scheme:
      nativeToken.transferFrom(msg.sender, benificiary, fee);

      require(_controller.isSchemeRegistered(this));
      require(checkParameterHashMatch(_controller, _voteRegisterParams, _voteRemoveParams, _boolVote));
      Organization memory org;
      org.isRegistered = true;
      org.voteRegisterParams = _voteRegisterParams;
      org.voteRemoveParams = _voteRemoveParams;
      org.boolVote = _boolVote;
      organizations[_controller] = org;
    }

    function proposeScheme(Controller _controller, address _scheme, bytes32 _parametersHash, bool _isRegistering) returns(bytes32) {
        Organization org = organizations[_controller];
        require(org.isRegistered); // Check org is registred to use this universal scheme.
        require(! _controller.isSchemeRegistered(_scheme)); // Check the controller does'nt already have the propded scheme.
        require(checkParameterHashMatch(_controller,
                      org.voteRegisterParams,
                      org.voteRemoveParams,
                      org.boolVote));
        BoolVoteInterface boolVote = org.boolVote;
        bytes32 id = boolVote.propose(org.voteRegisterParams);
        if (org.proposals[id].proposalType != 0) revert();
        org.proposals[id].proposalType = 1;
        org.proposals[id].scheme = _scheme;
        org.proposals[id].parametersHash = _parametersHash;
        org.proposals[id].isRegistering = _isRegistering;
        voteScheme(_controller, id, true);
        return id;
    }

    function proposeToRemoveScheme(Controller _controller, address _scheme) returns(bytes32) {
        Organization org = organizations[_controller];
        require(org.isRegistered); // Check org is registred to use this universal scheme.
        require(_controller.isSchemeRegistered(_scheme)); // Check the scheme is registered in controller.
        require(checkParameterHashMatch(_controller,
                      org.voteRegisterParams,
                      org.voteRemoveParams,
                      org.boolVote));
        BoolVoteInterface boolVote = org.boolVote;
        bytes32 id = boolVote.propose(org.voteRemoveParams);
        if (org.proposals[id].proposalType != 0) revert();
        org.proposals[id].proposalType = 2;
        org.proposals[id].scheme = _scheme;
        voteScheme(_controller, id, true);
        return id;
    }

    function voteScheme( Controller _controller, bytes32 id, bool _yes ) returns(bool) {
        BoolVoteInterface boolVote = organizations[_controller].boolVote;
        if( ! boolVote.vote(id, _yes, msg.sender) ) return false;
        if( boolVote.voteResults(id) ) {
            SchemeProposal memory proposal = organizations[_controller].proposals[id];
            if( ! boolVote.cancellProposel(id) ) revert();
            if( organizations[_controller].proposals[id].proposalType == 2 ) {
                if( ! _controller.unregisterScheme(proposal.scheme) ) revert();
            }
            else {
                if( ! _controller.registerScheme(proposal.scheme, proposal.isRegistering, proposal.parametersHash) ) revert();
            }
            organizations[_controller].proposals[id].proposalType = 0;
        }
    }

    function getVoteStatus(Controller _controller, bytes32 id) constant returns(uint[3]) {
        BoolVoteInterface boolVote = organizations[_controller].boolVote;
        return (boolVote.voteStatus(id));
    }
}
