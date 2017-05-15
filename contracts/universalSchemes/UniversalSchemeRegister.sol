pragma solidity ^0.4.11;

import "../controller/Controller.sol";  // Should change to controller intreface.
import "../UniversalSimpleVoteInterface.sol";

contract UniversalSchemeRegister {
    struct SchemeProposal {
      address scheme;
      bytes32 parametersHash;
      uint proposalType; // 1: add a schme, 2: remove a scheme.
      bool isRegistering;
    }

    struct Organization {
      bool isRegistered;
      uint precToRegister;
      uint precToRemove;
      UniversalSimpleVoteInterface simpleVote;
      mapping(bytes32=>SchemeProposal) proposals;
    }

    mapping(address=>Organization) organizations;

    function UniversalSchemeRegister( ) {
    }

    function parametersHash(uint _precToRegister,
                                uint _precToRemoveSchem,
                                UniversalSimpleVoteInterface _universalSimpleVote)
                                constant returns(bytes32) {
      require(_precToRegister<=100);
      require(_precToRemoveSchem<=100);
      return (sha3(_precToRegister, _precToRemoveSchem, _universalSimpleVote));
    }

    function checkParameterHashMatch(Controller _controller,
                     uint _precToRegister,
                     uint _precToRemoveSchem,
                     UniversalSimpleVoteInterface _universalSimpleVote) constant returns(bool) {
       return (_controller.getSchemeParameters(this) == parametersHash(_precToRegister,_precToRemoveSchem,_universalSimpleVote));
    }

    function addOrUpdateOrg(Controller _controller,
                     uint _precToRegister,
                     uint _precToRemoveSchem,
                     UniversalSimpleVoteInterface _universalSimpleVote) {
      require(_controller.isSchemeRegistered(this));
      require(checkParameterHashMatch(_controller, _precToRegister, _precToRemoveSchem, _universalSimpleVote));
      Organization memory org;
      org.isRegistered = true;
      org.precToRegister = _precToRegister;
      org.precToRemove = _precToRemoveSchem;
      org.simpleVote = _universalSimpleVote;
      organizations[_controller] = org;
    }

    function proposeScheme(Controller _controller, address _scheme, bytes32 _parametersHash, bool _isRegistering) returns(bytes32) {
        Organization org = organizations[_controller];
        require(org.isRegistered); // Check org is registred to use this universal scheme.
        require(! _controller.isSchemeRegistered(_scheme)); // Check the controller does'nt already have the propded scheme.
        require(checkParameterHashMatch(_controller,
                      org.precToRegister,
                      org.precToRemove,
                      org.simpleVote));
        UniversalSimpleVoteInterface simpleVote = org.simpleVote;
        bytes32 id = simpleVote.propose(_controller.nativeReputation(), org.precToRegister);
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
                      org.precToRegister,
                      org.precToRemove,
                      org.simpleVote));
        UniversalSimpleVoteInterface simpleVote = org.simpleVote;
        bytes32 id = simpleVote.propose(_controller.nativeReputation(), org.precToRemove);
        if (org.proposals[id].proposalType != 0) revert();
        org.proposals[id].proposalType = 2;
        org.proposals[id].scheme = _scheme;
        voteScheme(_controller, id, true);
        return id;
    }

    function voteScheme( Controller _controller, bytes32 id, bool _yes ) returns(bool) {
        UniversalSimpleVoteInterface simpleVote = organizations[_controller].simpleVote;
        if( ! simpleVote.vote(id, _yes, msg.sender) ) return false;
        if( simpleVote.voteResults(id) ) {
            SchemeProposal memory proposal = organizations[_controller].proposals[id];
            if( ! simpleVote.cancellProposel(id) ) revert();
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
        UniversalSimpleVoteInterface simpleVote = organizations[_controller].simpleVote;
        return (simpleVote.voteStatus(id));
    }
}
