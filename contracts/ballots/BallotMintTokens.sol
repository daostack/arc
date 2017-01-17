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

    event BallotExecuted(string msg);

    uint[] proposals = [0, 1];
    // map proposals to amount of votes
    mapping (uint => uint) voteCount;
    // map voters to their votes
    mapping(address => uint) public voters;

    function BallotMintTokens( 
        address _dco,
        uint256 _amount,
        address _beneficary
        )  Ballot (DCOInterface(_dco).reputationContract()) {
        dco = DCOInterface(_dco);
        amount = _amount;
        beneficary = _beneficary;
    }
    /// @dev Computes the winning proposal taking all
    /// previous votes into account.
    function vote(uint _proposal) {

        if (voters[msg.sender] != 0) {
            // voter has already voted
            throw;
        }
        voters[msg.sender] = _proposal;

        // If `proposal` is out of the range of the array,
        // this will throw automatically and revert all changes.
        voteCount[proposals[_proposal]] += reputationContract.reputationOf(msg.sender);

    }
    function winningProposal() constant
            returns (uint)
    {
        uint winningProposal;
        uint winningVoteCount = 0;
        uint totalReputation = reputationContract.totalReputation();
        for (uint p = 0; p < proposals.length; p++) {
            if (voteCount[proposals[p]] > winningVoteCount) {
                winningVoteCount = voteCount[proposals[p]];
                winningProposal = p;
            }
        }
        // the winning proposal should have at least half ot he totalReputation
        if (totalReputation < winningVoteCount * 2) {
            return winningProposal;
        }
        return 0;

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