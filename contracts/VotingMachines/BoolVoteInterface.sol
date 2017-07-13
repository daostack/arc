pragma solidity ^0.4.11;

import "../universalSchemes/ExecutableInterface.sol";

contract BoolVoteInterface {
    function propose(bytes32 _proposalParameters, address _avatar, ExecutableInterface _executable) returns(bytes32);

    function cancelProposal(bytes32 id) returns(bool);

    function vote(bytes32 id, bool yes, address voter) returns(bool);

    function cancelVoting(uint id);

    function checkVoteEnded(uint id) returns(bool);

    function voteStatus(bytes32 id) constant returns(uint[3]);
}
