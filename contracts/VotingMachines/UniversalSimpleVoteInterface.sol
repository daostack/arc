pragma solidity ^0.4.11;

import "./controller/Controller.sol";  // Should change to controller intreface.
import "./controller/Reputation.sol";

contract UniversalSimpleVoteInterface {
    function propose(Reputation _reputationSystem, uint _absPrecReq) returns(bytes32);

    function cancellProposel(bytes32 id) returns(bool);

    function vote(bytes32 id, bool yes, address voter) returns(bool);

    function voteResults(bytes32 id) constant returns(bool);

    function voteStatus(bytes32 id) constant returns(uint[3]);
}
