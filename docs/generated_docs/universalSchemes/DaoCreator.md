# DaoCreator
[see the source](https://github.com/daostack/arc/tree/master/contracts/universalSchemes/DaoCreator.sol)

*Code deposit cost: **less than 4682200 gas.***

*Execution cost: **less than 5484 gas.***

*Total deploy cost(deposit + execution): **less than 4687684 gas.***

> Genesis Scheme that creates organizations

## Constructors
### DaoCreator()

*Execution cost: **No bound available.***

**nonpayable**

*Params:*

*Nothing*


## Events
### NewOrg(address)
*Params:*

1. **_avatar** *of type address*

---
### InitialSchemesSet(address)
*Params:*

1. **_avatar** *of type address*


## Fallback
*Nothing*
## Functions
### setSchemes(address, address[], bytes32[], bytes4[])

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_avatar** *of type address*
2. **_schemes** *of type address[]*
3. **_params** *of type bytes32[]*
4. **_permissions** *of type bytes4[]*

*Returns:*

*Nothing*

---
### forgeOrg(bytes32, string, string, address[], uint256[], int256[], address)

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


