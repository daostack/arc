# *contract* GenesisScheme ([source](https://github.com/daostack/daostack/tree/master/./contracts/universalSchemes/GenesisScheme.sol))
*Code deposit cost: **less than 4503000 gas.***

*Execution cost: **less than 5238 gas.***

*Total deploy cost(deposit + execution): **less than 4508238 gas.***

> Genesis Scheme that creates organizations

The *Genesis Scheme* is a special scheme that creates a brand new DAO and initializes it with a set of default *Schemes*.
It is the main way to create new DAOs on the DAOStack.

## Usage

### Step 1: Create the organization
```
GenesisScheme gs = new GenesisScheme();
address avatar = 
    gs.forgeOrg(
        "Organization name",
        "Token name",
        "TKN", /*Token symbol*/
        [me,you], /*founders addresses*/
        [5,7], /*founders initial token allocation*/
        [10,12], /*founders initial reputation allocation*/
    );
```

### Step 2: Configure some schemes
```
ContributionReward crScheme = new ContributionReward();
bytes32 paramsHash = crScheme.setParameters(...);

bytes4 permission = 0; /* set to zero = no special permissions */
    /* permission is a 4 bit number indicating what kind of operations can the scheme do in this organization:
        1st bit - irrelevent to us.
        2nd bit - can register other schemes.
        3rd bit - can add/remove global constraints.
        4th bit - can upgrade controller. 
    */
```
### Step 3: Register schemes with the organization
```
gs.setSchemes(
    Avatar(avatar),
    [address(crSchemes)], /* schemes to regsiter*/
    [paramsHash], /* params hash */
    [true], /* is the scheme a universal scheme */
    [permission] 
);
```
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
4. **_permissions** *of type bytes4[]*

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
7. **_uController** *of type address*

*Returns:*
1. **unnamed** *of type address*


