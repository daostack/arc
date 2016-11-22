pragma solidity ^0.4.4;

import "./Ballot.sol";
import "./MintableToken.sol";


contract BallotMintTokens is Ballot {
	/* a ballot to decide how many tokens to assign
		to a certain address.
		- votes can be any uint256
		- It takes the median value of _all_ the votes
		- it needs a 
	*/

	bool public executed;
	address public beneficary;
	MintableToken public tokenContract;

    /// Create a new ballot to choose one of `proposalNames`.
    function BallotMintTokens( 
    	Reputation reputationContractAddress,
        MintableToken tokenContractAddress,
        address beneficaryAddress
        ) 
    	Ballot(reputationContractAddress)
    {
        reputationContract = reputationContractAddress;
        tokenContract = tokenContractAddress;
        beneficary = beneficaryAddress;

        // For each of the provided proposal names,
        // create a new proposal object and add it
        // to the end of the array.
        // for (uint i = 0; i < proposalNames.length; i++) {
        //     // `Proposal({...})` creates a temporary
        //     // Proposal object and `proposals.push(...)`
        //     // appends it to the end of `proposals`.
        //     proposals.push(Proposal({
        //         name: proposalNames[i],
        //         voteCount: 0
        //     }));
        // }
    }
    function executeWinningProposal() {
        // do something with the winning proposal
        executed = true;
        // only succeeds if msg.sender is the owner of the tokenContract
        tokenContract.mint(10, beneficary);

    }	
}