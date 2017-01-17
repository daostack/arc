pragma solidity ^0.4.4;

import "./Ballot.sol";
import "./NamedProposalBallot.sol";
import "../DCOInterface.sol";
import "../MintableToken.sol";
import "../Reputation.sol";


contract BallotMintTokens is NamedProposalBallot {
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

    event BallotExecuted(string msg);

    bytes32[] _proposals = [bytes32("n"), bytes32("y")];

    function BallotMintTokens( 
        address _dco,
        uint256 _amount,
        address _beneficary
        )  NamedProposalBallot (DCOInterface(_dco).reputationContract(), _proposals) {
        dco = DCOInterface(_dco);
        amount = _amount;
        beneficary = _beneficary;
    }
    /// @dev Computes the winning proposal taking all
    /// previous votes into account.
    function winningProposal() constant
            returns (uint)
    {
        uint winningProposal;
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal = p;
            }
        }
        // winningProposal = 0;
        return winningProposal;
        // uint totalReputation = dco.reputationContract().totalReputation();
        // if (winningVoteCount * 2 < totalrepu) {
        //     winningProposal = 0;

        // } 
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