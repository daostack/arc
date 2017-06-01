pragma solidity ^0.4.11;

contract BoolVoteInterface {
    function propose(bytes32 _proposalParameters) returns(bytes32);

    function cancellProposel(bytes32 id) returns(bool);

    function vote(bytes32 id, bool yes, address voter) returns(bool);

    function voteResults(bytes32 id) constant returns(bool);

    function voteStatus(bytes32 id) constant returns(uint[3]);
}
