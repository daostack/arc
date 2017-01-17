pragma solidity ^0.4.4;

import "./Ballot.sol";
import "../DCOInterface.sol";
import "../MintableToken.sol";
import "../Reputation.sol";


contract BallotMintTokens is Ballot {
	/* a ballot to decide to assign a number of new tokens to a given beneficary 

    The constructor takes the following arguments:

        _dco: 
        _amount: the amount of tokens to assign
        _beneficary: the beneficary of the action

    The proposal can be executed in case:
        - more than 50% of reputation holders in the reputation contract 
          have voted 'y' on the ballot
        - the reputationContract has the rights to mint new tokens

	*/

    bool public executed;
    DCOInterface public dco;
    uint256 public amount;
    address public beneficary;


    function BallotMintTokens( 
        address _dco,
        uint256 _amount,
        address _beneficary
        )  Ballot (DCOInterface(_dco).reputationContract()) {
        dco = DCOInterface(_dco);
        amount = _amount;
        beneficary = _beneficary;
    }


    function executeWinningProposal() returns (bool) {
        /*
            This function expects to be called from the dco (by calling dco.executeBallot(ballot))
        */
        if (winningProposal() == 1) {
            dco.mintTokens(amount, beneficary, dco.tokenContract());
            BallotExecuted('BallotMintTokens executed');
            return true;
        } 
        return false;

        // use "delegatecall" to have code running in the context of the original msg.sender
        // if (!dco.delegatecall(bytes4(sha3("mintTokens(uint256,address,address)")), amount, beneficary, dco.tokenContract())) {
        //     throw;
        // } 
    }   

}