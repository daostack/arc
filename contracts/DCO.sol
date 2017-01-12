pragma solidity ^0.4.4;

import "./zeppelin-solidity/Ownable.sol";
import "./Reputation.sol";
import "./Token.sol";
import "./MintableToken.sol";
import "./ballots/Ballot.sol";
import "./ballots/BallotMintTokens.sol";

contract DCO is Ownable {
    MintableToken public tokenContract;
    Reputation public reputationContract;

    event BallotCreated(address indexed ballotaddress); 

    // the creator of the DCO must be owner of the token contract
    function DCO(
        Reputation _reputationContract,
        MintableToken _tokenContract
        ) {
        reputationContract = _reputationContract;
        tokenContract = _tokenContract;
        // TODO: transfer ownership 
        // tokenContract.transferOwnership(this);
    }

    function createBallotToMintTokens(address _recipient, uint _amount) returns (BallotMintTokens) {
        BallotMintTokens ballot = new BallotMintTokens(reputationContract, tokenContract,  _amount, _recipient);
        BallotCreated(ballot);
        return ballot;
    }

    function vote(Ballot _ballot, uint _vote) {
        _ballot.registerVote(_vote, msg.sender);
    }

    function executeBallot(BallotMintTokens _ballot) {
        if (_ballot.winningProposal() == 1) {
            tokenContract.mint(_ballot.amount(), _ballot.beneficary());
        }
    }

}
