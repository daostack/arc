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

*/

contract DCO is Ownable {
    MintableToken public tokenContract;
    Reputation public reputationContract;

    event BallotCreated(address indexed ballotaddress); 
    event BallotExecuted(string msg); 

    // the creator of the DCO must be owner of the token contract
    function DCO(
        Reputation _reputationContract,
        MintableToken _tokenContract
        ) {
        reputationContract = _reputationContract;
        tokenContract = _tokenContract;

    }

    function createBallotToMintTokens(uint _amount, address _recipient) returns (BallotMintTokens) {
        BallotMintTokens ballot = new BallotMintTokens(reputationContract, tokenContract,  _amount, _recipient);
        BallotCreated(ballot);
        return ballot;
    }

    function addBallot(string ballotType, bytes32 arg1, bytes32 arg2 ) returns (BallotMintTokens) {
        BallotMintTokens ballot = new BallotMintTokens(reputationContract, tokenContract,  uint(arg1), address(arg2));
        BallotCreated(ballot);
        return ballot;
    }
    function vote(Ballot _ballot, uint _vote) {
        _ballot.registerVote(_vote, msg.sender);
    }

    function executeBallot(BallotMintTokens _ballot) {
        if (_ballot.winningProposal() == 1) {
            bool result = tokenContract.mint(_ballot.amount(), _ballot.beneficary());
            if (result) {
                BallotExecuted("Minted your tokens!!! address");
            }
        }
    }

}
