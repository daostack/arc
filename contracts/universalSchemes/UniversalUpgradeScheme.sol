pragma solidity ^0.4.11;

import "../controller/Controller.sol";
import "../VotingMachines/BoolVoteInterface.sol";
import "./UniversalScheme.sol";

contract UniversalUpgradeScheme is UniversalScheme {
    struct UpgradeProposal {
      address newContOrScheme;
      bytes32 params;
      uint proposalType; // 1: Upgrade controller, 2: change upgrade scheme.
    }

    struct Organization {
      bool isRegistered;
      bytes32 voteParams;
      BoolVoteInterface boolVote;
      mapping(bytes32=>UpgradeProposal) proposals;
    }

    mapping(address=>Organization) organizations;

    function UniversalUpgradeScheme(StandardToken _nativeToken, uint _fee, address _benificiary) {
      updateParameters(_nativeToken, _fee, _benificiary, bytes32(0));
    }

    function parametersHash(bytes32 _voteParams, BoolVoteInterface _boolVote) constant returns(bytes32) {
      return (sha3(_voteParams, _boolVote));
    }

    function checkParameterHashMatch(Controller _controller, bytes32 _voteParams,
                     BoolVoteInterface _boolVote) constant returns(bool) {
       return (_controller.upgradingSchemeParams() == parametersHash(_voteParams, _boolVote));
    }

    function addOrUpdateOrg(Controller _controller, bytes32 _voteParams, BoolVoteInterface _boolVote) {

      // Pay fees for using scheme:
      nativeToken.transferFrom(msg.sender, benificiary, fee);

      require(_controller.upgradingScheme() == address(this));
      require(checkParameterHashMatch(_controller, _voteParams, _boolVote));
      Organization memory org;
      org.isRegistered = true;
      org.voteParams = _voteParams;
      org.boolVote = _boolVote;
      organizations[_controller] = org;
    }

    function proposeUpdate(Controller _controller, address _newController) returns(bytes32) {
        Organization org = organizations[_controller];
        require(org.isRegistered); // Check org is registred to use this universal scheme.
        require(checkParameterHashMatch(_controller, org.voteParams, org.boolVote));
        BoolVoteInterface boolVote = org.boolVote;
        bytes32 id = boolVote.propose(org.voteParams);
        if (org.proposals[id].proposalType != 0) revert();
        org.proposals[id].proposalType = 1;
        org.proposals[id].newContOrScheme = _newController;
        voteScheme(_controller, id, true);
        return id;
    }

    function proposeChagneUpdateScheme(Controller _controller, address _scheme, bytes32 _params) returns(bytes32) {
        Organization org = organizations[_controller];
        require(org.isRegistered); // Check org is registred to use this universal scheme.
        require(checkParameterHashMatch(_controller, org.voteParams, org.boolVote));
        BoolVoteInterface boolVote = org.boolVote;
        bytes32 id = boolVote.propose(org.voteParams);
        if (org.proposals[id].proposalType != 0) revert();
        org.proposals[id].proposalType = 2;
        org.proposals[id].newContOrScheme = _scheme;
        org.proposals[id].params = _params;
        voteScheme(_controller, id, true);
        return id;
    }

    function voteScheme( Controller _controller, bytes32 id, bool _yes ) returns(bool) {
        BoolVoteInterface boolVote = organizations[_controller].boolVote;
        if( ! boolVote.vote(id, _yes, msg.sender) ) return false;
        if( boolVote.voteResults(id) ) {
            UpgradeProposal memory proposal = organizations[_controller].proposals[id];
            if( ! boolVote.cancellProposel(id) ) revert();
            if( organizations[_controller].proposals[id].proposalType == 2 ) {
                if( ! _controller.changeUpgradeScheme(proposal.newContOrScheme, proposal.params) ) revert();
            }
            if( organizations[_controller].proposals[id].proposalType == 1 ) {
                if( ! _controller.upgradeController(proposal.newContOrScheme) ) revert();
            }
            organizations[_controller].proposals[id].proposalType = 0;
        }
    }

    function getVoteStatus(Controller _controller, bytes32 id) constant returns(uint[3]) {
        BoolVoteInterface boolVote = organizations[_controller].boolVote;
        return (boolVote.voteStatus(id));
    }
}
