pragma solidity ^0.4.4;

import "./Ballot.sol";
import "./NamedProposalBallot.sol";
import "../MintableToken.sol";
import "../Reputation.sol";


contract BallotMintTokens is NamedProposalBallot {
	/* a ballot to decide to assign a number of new tokens to a given beneficary 

    The constructor takes the following arguments:

        _reputationContract: a Reputation contract
        _tokenContract: A MintableToken contract
        _amount: the amount of tokens to assign
        _beneficary: the beneficary of the action

    The proposal can be executed in case:
        - more than 50% of reputation holders in the reputation contract 
          have voted 'y' on the ballot
        - the reputationContract has the rights to mint new tokens

	*/

    bool public executed;
	address public beneficary;
	MintableToken public tokenContract;
    Reputation public reputationContract;
    uint256 public amount;

    bytes32[] _proposals = [bytes32("n"), bytes32("y")];

    function BallotMintTokens( 
    	Reputation _reputationContract,
        MintableToken _tokenContract,
        uint256 _amount,
        address _beneficary
        ) NamedProposalBallot(_reputationContract, _proposals) {
        reputationContract = _reputationContract;
        tokenContract = MintableToken(_tokenContract);
        beneficary = _beneficary;
        amount = _amount;
    }

    function executeWinningProposal() returns (bool) {
        // if (winningProposal() == 0 && !executed) {
            // executed = true;
            // tokenContract.mint(amount, beneficary);
            // if (tokenContract.mint(amount, beneficary) == true) {
            // //     // executed = true; 
            //     return true;
            // }
            // return true;
        // } else {
            // throw;
            // return false;
        // }
    }	
}