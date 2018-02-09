# TokenCapGC
[see the source](https://github.com/daostack/arc/tree/master/contracts/globalConstraints/TokenCapGC.sol)

*Code deposit cost: **less than 197600 gas.***

*Execution cost: **less than 233 gas.***

*Total deploy cost(deposit + execution): **less than 197833 gas.***

> Token Cap Global Constraint

## Constructors
*Nothing*
## Events
*Nothing*
## Fallback
*Nothing*
## Functions
### when()
> when return if this globalConstraints is pre, post or both.

*Execution cost: **less than 325 gas.***

**constant | pure**

*Inputs:*

*Nothing*

CallPhase enum indication  Pre, Post or PreAndPost.
---
### setParameters(address, uint256)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_token** *of type address*
2. **_cap** *of type uint256*

*Returns:*

1. **unnamed** *of type bytes32*

---
### pre(address, bytes32, bytes)

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*

1. **unnamed** *of type address*
2. **unnamed** *of type bytes32*
3. **unnamed** *of type bytes*

*Returns:*

1. **unnamed** *of type bool*

---
### post(address, bytes32, bytes)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **unnamed** *of type address*
2. **_paramsHash** *of type bytes32*
3. **unnamed** *of type bytes*

*Returns:*

1. **unnamed** *of type bool*

---
### params(bytes32)

*Execution cost: **less than 934 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type bytes32*

*Returns:*

1. **token** *of type address*
2. **cap** *of type uint256*

---
### getParametersHash(address, uint256)

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*

1. **_token** *of type address*
2. **_cap** *of type uint256*

*Returns:*

1. **unnamed** *of type bytes32*


