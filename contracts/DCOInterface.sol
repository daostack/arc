pragma solidity ^0.4.4;


/*
A DCO is a Decentralized Collaborative Organization. 

It is associated with a Token contract and a Reputation contract.

Use it like this:
(NOTE: this is a bit clumsy and my change in the future)

    dco =  new DCO(tokenContract.address, reputationContract.address); 
    tokenContract.transferOwnership(dco.address)
    reputationContract.transferOwnership(dco.address)

*/
import "./Reputation.sol";
import "./Token.sol";
import "./MintableToken.sol";
import "./ballots/Ballot.sol";

contract DCOInterface {
    MintableToken public tokenContract;
    Reputation public reputationContract;

    event BallotCreated(address indexed ballotaddress); 
    event BallotExecuted(string msg); 

    mapping (address => bool) registeredBallots;

    function vote(Ballot _ballot, uint _vote); 

    function executeBallot(address _ballot) returns (bool);

    function registerBallotToMintTokens(uint256 _amount, address _beneficary);

    function mintTokens(uint256 _amount, address _beneficary, address _tokenContract);
}
