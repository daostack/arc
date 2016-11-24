# Reputation contract with weighted median voting 


Step 5 and 6 in the DAO stack

## Description

Reputation contract with weighted median voting 

## Status

In development. 

## Remarks

These are some questions that need to be answered:

* What are we voting on? (I.e. what is a "proposal"?) (We do not need to answer this question exhaustively at this stage, but we do not some generic way of representing it. ) One possible answer: here is a [Ballot.sol contract](../daostack/contracts/Ballot.sol) 
* Efficiency. The contract should be able to tally many many votes, so needs to be clever about storage and calculation (choosing the median seems much more difficult than, e.g. keeping track of the avg...)

## Resources

### Solidity code

### Tests

### Address on the blockchain

### How to use the contract

