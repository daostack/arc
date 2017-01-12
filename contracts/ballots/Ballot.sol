pragma solidity ^0.4.4;
/*
*/

import "../Reputation.sol";
import "../zeppelin-solidity/Ownable.sol";


/// @title Voting
contract Ballot is Ownable {

    Reputation public reputationContract;
    bool public executed = false;

    // mapping address to the proposal that they voted
    mapping(address => bytes32) public voters;

    /// Create a new ballot to choose one of `proposalNames`.
    function Ballot(Reputation _reputationContractAddress) {
        reputationContract = _reputationContractAddress;
    }

    /// Give your vote to proposal `proposals[proposal].name`.
    function vote(uint proposal); 

    function registerVote(uint _proposal, address _voter); 

    /// @dev Computes the winning proposal taking all
    /// previous votes into account.
    function winningProposal() constant returns (uint winningProposal);

    function executeWinningProposal() returns (bool) {
        // do something with the winning proposal, return true if executed, false if not

    }
}
