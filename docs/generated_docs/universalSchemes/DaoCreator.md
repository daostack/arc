# DaoCreator
[see the source](https://github.com/daostack/daostack/tree/master/contracts/universalSchemes/DaoCreator.sol)

*Code deposit cost: **less than 4440000 gas.***

*Execution cost: **less than 5150 gas.***

*Total deploy cost(deposit + execution): **less than 4445150 gas.***

> Genesis Scheme that creates organizations


## Reference
### Constructors
#### *constructor* DaoCreator()

*Execution cost: **No bound available.***

**nonpayable**

*Params:*

*Nothing*


### Events
#### *event* NewOrg
*Params:*

1. **_avatar** *of type address*


#### *event* InitialSchemesSet
*Params:*

1. **_avatar** *of type address*


### Fallback
*Nothing*
### Functions
#### *function* setSchemes

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_avatar** *of type address*
2. **_schemes** *of type address[]*
3. **_params** *of type bytes32[]*
4. **_permissions** *of type bytes4[]*

*Returns:*

*Nothing*


#### *function* forgeOrg

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_orgName** *of type bytes32*
2. **_tokenName** *of type string*
3. **_tokenSymbol** *of type string*
4. **_founders** *of type address[]*
5. **_foundersTokenAmount** *of type uint256[]*
6. **_foundersReputationAmount** *of type int256[]*
7. **_uController** *of type address*

*Returns:*

1. **unnamed** *of type address*


