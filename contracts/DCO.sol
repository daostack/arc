pragma solidity ^0.4.4;

import "./zeppelin-solidity/Ownable.sol";
import "./Reputation.sol";
import "./Token.sol";
import "./MintableToken.sol";
import "./ballots/Ballot.sol";
import "./ballots/BallotMintTokens.sol";

/*
A DCO is a Decentralized Collaborative Organization. 

It is associated with a Token contract and a Reputation contract.

Use it like this:
(NOTE: this is a bit clumsy and my change in the future)

    dco =  new DCO(tokenContract.address, reputationContract.address); 
    tokenContract.transferOwnership(dco.address)
    reputationContract.transferOwnership(dco.address)

*/

contract DCO is Ownable {
    MintableToken public tokenContract;
    Reputation public reputationContract;

    event BallotCreated(address indexed ballotaddress); 
    event BallotExecuted(string msg); 

    mapping (address => bool) registeredBallots;
    modifier onlyRegisteredBallot() { 
        // this function can only be executed by a registered contract
        if (registeredBallots[msg.sender])
            _;
    }

    // the creator of the DCO must be owner of the token contract
    function DCO(
        Reputation _reputationContract,
        MintableToken _tokenContract
        ) {
        reputationContract = _reputationContract;
        tokenContract = _tokenContract;

    }

    function vote(Ballot _ballot, uint _vote) {
        /* cast a vote in a ballot */
        _ballot.registerVote(_vote, msg.sender);
    }

    function executeBallot(address _ballot) returns (bool) {
        /* execute the winning proposal in a ballot */
        if (!registeredBallots[_ballot]) {
            BallotExecuted('execution failed because ballot is not registered');
            return false; 
        }
        Ballot ballot = Ballot(_ballot);
        if (!ballot.executeWinningProposal()) {
            BallotExecuted('execution failed');
            return false;
        }
        BallotExecuted('ballot executed');
        return true;
    }

    function registerBallotMintTokens(uint256 _amount, address _beneficary) {
        BallotMintTokens ballot = new BallotMintTokens(this, _amount, _beneficary);
        registeredBallots[ballot] = true;
        BallotCreated(ballot);
    }

    function mintTokens(uint256 _amount, address _beneficary, address _tokenContract ) 
        onlyRegisteredBallot {
        MintableToken(_tokenContract).mint(_amount, _beneficary); 
    }
}
