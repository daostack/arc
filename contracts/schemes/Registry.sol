pragma solidity ^0.4.11;

import "../VotingMachines/BoolVoteInterface.sol";
import "../universalSchemes/UniversalScheme.sol";
import "zeppelin/contracts/token/StandardToken.sol";

contract Registry {
  struct Proposal {
    uint proposalType; // 1: internal params, 2: add record, 3: remove record, 4: change params.
    address record;
    BoolVoteInterface boolVote;
    StandardToken nativeToken;
    uint fee;
    address beneficiary;
    bytes32[] params;
  }

  BoolVoteInterface boolVote;
  bytes32 changedInternalParams;
  bytes32 addParams;
  bytes32 removeParams;
  bytes32 changeParams;
  StandardToken nativeToken;
  uint fee;
  address beneficiary;

  mapping(address=>bool) registry;
  mapping(bytes32=>Proposal) proposals;

  function Registry(BoolVoteInterface _boolVote, bytes32 _changedInternalParams, bytes32 _addParams,
                    bytes32 _removeParams, bytes32 _changeParams, StandardToken _nativeToken,
                    uint _fee, address _beneficiary, address[] _initialRegistry) {
    boolVote = _boolVote;
    changedInternalParams = _changedInternalParams;
    addParams = _addParams;
    removeParams = _removeParams;
    changeParams = _changeParams;
    beneficiary = _beneficiary;
    nativeToken = _nativeToken;
    fee = _fee;
    for (uint cnt=0 ; cnt<_initialRegistry.length ; cnt++) {
      registry[_initialRegistry[cnt]] = true;
    }
  }

  function changeInternalParams(BoolVoteInterface _boolVote, bytes32 _changedInternalParams, bytes32 _addParams,
                                bytes32 _removeParams, bytes32 _changeParams, StandardToken _nativeToken,
                                uint _fee, address _beneficiary) returns(bytes32) {
    // Pay fee:
    nativeToken.transferFrom(msg.sender, beneficiary, fee);
    // Open proposal:
    bytes32 id = boolVote.propose(changedInternalParams);
    if (proposals[id].proposalType != 0) revert();
    proposals[id].proposalType = 1;
    proposals[id].boolVote = _boolVote;
    proposals[id].nativeToken = _nativeToken;
    proposals[id].fee = _fee;
    proposals[id].beneficiary = _beneficiary;
    proposals[id].params = [_changedInternalParams, _addParams, _removeParams, _changeParams];
    return id;
  }

  function prposeRecord(address _record) returns(bytes32) {
    // Check record does not exist:
    require(! registry[_record]);
    // Pay fee:
    nativeToken.transferFrom(msg.sender, beneficiary, fee);
    // Open proposal:
    bytes32 id = boolVote.propose(removeParams);
    if (proposals[id].proposalType != 0) revert();
    proposals[id].proposalType = 2;
    proposals[id].record = _record;
    return id;
  }

  function removeRecord(address _record) returns(bytes32) {
    // Check record exists:
    require(registry[_record]);
    // Pay fee:
    nativeToken.transferFrom(msg.sender, beneficiary, fee);
    // Open proposal:
    bytes32 id = boolVote.propose(removeParams);
    if (proposals[id].proposalType != 0) revert();
    proposals[id].proposalType = 3;
    proposals[id].record = _record;
    return id;
  }

  function changeParameters(address _record, bytes32 _params, StandardToken _nativeToken,
                            uint _fee, address _beneficiary) returns(bytes32) {
    // Pay fee:
    nativeToken.transferFrom(msg.sender, beneficiary, fee);
    // Open proposal:
    bytes32 id = boolVote.propose(changeParams);
    if (proposals[id].proposalType != 0) revert();
    proposals[id].proposalType = 4;
    proposals[id].record = _record;
    proposals[id].nativeToken = _nativeToken;
    proposals[id].fee = _fee;
    proposals[id].beneficiary = _beneficiary;
    proposals[id].params[0] = _params;
    return id;
  }

  function vote(bytes32 _id, bool _yes) returns(bool){
    if( ! boolVote.vote(_id, _yes, msg.sender) ) return false;
    if( boolVote.voteResults(_id) ) {
        Proposal memory proposal = proposals[_id];
        if  (proposal.proposalType == 1) {
          boolVote = proposal.boolVote;
          changedInternalParams = proposal.params[0];
          addParams = proposal.params[1];
          removeParams = proposal.params[2];
          changeParams = proposal.params[3];
          beneficiary = proposal.beneficiary;
          fee = proposal.fee;
          return true;
        }

        if  (proposal.proposalType == 2) {
          registry[proposal.record] = true;
          return true;
        }

        if  (proposal.proposalType == 3) {
          delete registry[proposal.record];
          return true;
        }

        if  (proposal.proposalType == 4) {
          UniversalScheme scheme = UniversalScheme(proposal.record);
          scheme.updateParameters(proposal.nativeToken, proposal.fee, proposal.beneficiary, proposal.params[0]);
          return true;
        }
    }
  }
}
