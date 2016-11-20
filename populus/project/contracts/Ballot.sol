pragma solidity ^0.4.4;
/*
*/

import "./Reputation.sol";


/// @title Voting
contract Ballot {

    Reputation public reputationContract;

    // mapping address to the proposal that they voted
    mapping(address => bytes32) public voters;

    /// Create a new ballot to choose one of `proposalNames`.
    function Ballot(
        Reputation reputationContractAddress) {
        reputationContract = reputationContractAddress;
    }

    /// Give your vote to proposal `proposals[proposal].name`.
    function vote(uint proposal); 

    /// @dev Computes the winning proposal taking all
    /// previous votes into account.
    function winningProposal() constant returns (uint winningProposal);

    function executeWinningProposal() {
        // do something with the winning proposal

    }
}
