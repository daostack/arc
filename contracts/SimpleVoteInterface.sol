pragma solidity ^0.4.7;
import "./controller/Reputation.sol";

contract SimpleVoteInterface {
    function setReputationSystem( Reputation _reputationSystem );
    function closeProposal( bytes32 proposalId ) returns(bool); 
    function newProposal( bytes32 proposalId ) returns(bool);
    function voteProposal( bytes32 proposalId, bool yes, address voter ) returns(bool);
    function setOwner( address _owner ) returns(bool);        
    function voteResults( bytes32 proposalId ) constant returns(bool);
    function voteStatus( bytes32 proposalId ) constant returns(uint[4]);
}
