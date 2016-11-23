# Reputation

Step 4 in the DAO stack.

## Description

Reputation Contract:
    * Initial distribution to owner of contract (default number)
    * From there on, owner (and only owner) can distribute power score to an address

## Status

Works. 

## Remarks

Rep can be either stored as a percentage (Ann has 2% rep, total = 100%) or as an arbitrary absolute numer (Ann as 11 rep out of a total of 550). This implementation takes the latter approach, as it seems more straigtforward, but (for efficiency/cost reasons) we may choose the former later.


## Resources

### Solidity code

[Reputation.sol](../contracts/Reputation.sol)

### Tests

[test_reputation.py](../tests/test_reputation.py)

### Address on the blockchain

### How to use the contract

