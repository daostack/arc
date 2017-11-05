pragma solidity ^0.4.15;

import "../universalSchemes/ExecutableInterface.sol";

contract BoolVoteInterface {
    function propose(bytes32 _proposalParameters, address _avatar, ExecutableInterface _executable) returns(bytes32);

    function cancelProposal(bytes32 _proposalId) returns(bool);

    function vote(bytes32 _proposalId, bool yes, address voter) returns(bool);

    function cancelVoting(uint _proposalId);

    function executeProposal(uint _proposalId) returns(bool);

    function voteStatus(bytes32 _proposalId) constant returns(uint[3]);
}
