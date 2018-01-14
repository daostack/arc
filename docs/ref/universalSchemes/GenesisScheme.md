# *contract* GenesisScheme ([source](https://github.com/daostack/daostack/tree/master/./contracts/universalSchemes/GenesisScheme.sol))
*Code deposit cost: **less than 4733600 gas.***

*Execution cost: **No bound available.***

*Total deploy cost(deposit + execution): **less than 4733600 gas.***

> Genesis Scheme that creates organizations


## Reference
- [Constructors](#constructors)
    - [GenesisScheme()](#constructor-genesisscheme)
- [Events](#events)
    - [NewOrg](#event-neworg)
    - [InitialSchemesSet](#event-initialschemesset)
- [Fallback](#fallback)
- [Functions](#functions)
    - [setSchemes](#function-setschemes)
    - [forgeOrg](#function-forgeorg)
    - [bytes4Array](#function-bytes4array)
    - [bytes32Array](#function-bytes32array)
    - [addressArray](#function-addressarray)
### Constructors
### *constructor* GenesisScheme()

*Execution cost: **No bound available.***

**nonpayable**

*Params:*
*Nothing*


### Events
### *event* NewOrg
*Params:*
1. **_avatar** *of type address*


### *event* InitialSchemesSet
*Params:*
1. **_avatar** *of type address*


### Fallback
*Nothing*
### Functions
### *function* setSchemes

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_avatar** *of type address*
2. **_schemes** *of type address[]*
3. **_params** *of type bytes32[]*
4. **_isUniversal** *of type bool[]*
5. **_permissions** *of type bytes4[]*

*Returns:*
*Nothing*


### *function* forgeOrg

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_orgName** *of type bytes32*
2. **_tokenName** *of type string*
3. **_tokenSymbol** *of type string*
4. **_founders** *of type address[]*
5. **_foundersTokenAmount** *of type uint256[]*
6. **_foundersReputationAmount** *of type int256[]*

*Returns:*
1. **unnamed** *of type address*


### *function* bytes4Array

*Execution cost: **less than 2476 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type uint256*

*Returns:*
1. **unnamed** *of type bytes4*


### *function* bytes32Array

*Execution cost: **less than 824 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type uint256*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* addressArray

*Execution cost: **less than 911 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type uint256*

*Returns:*
1. **unnamed** *of type address*


