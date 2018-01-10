# *contract* TokenCapGC ([source](https://github.com/daostack/daostack/tree/master/./contracts/globalConstraints/TokenCapGC.sol))
*Code deposit cost: **less than 183400 gas.***

*Execution cost: **less than 221 gas.***

*Total deploy cost(deposit + execution): **less than 183621 gas.***

> Token Cap Global Constraint


## Reference
- [Constructors](#constructors)

- [Events](#events)

- [Fallback](#fallback)
- [Functions](#functions)
    - [setParameters](#function-setparameters)
    - [pre](#function-pre)
    - [post](#function-post)
    - [params](#function-params)
    - [getParametersHash](#function-getparametershash)
### Constructors

### Events

### Fallback
*Nothing*
### Functions
### *function* setParameters

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_token** *of type address*
2. **_cap** *of type uint256*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* pre

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*
1. **unnamed** *of type address*
2. **unnamed** *of type bytes32*
3. **unnamed** *of type bytes*

*Returns:*
1. **unnamed** *of type bool*


### *function* post

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*
1. **unnamed** *of type address*
2. **_paramsHash** *of type bytes32*
3. **unnamed** *of type bytes*

*Returns:*
1. **unnamed** *of type bool*


### *function* params

*Execution cost: **less than 934 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type bytes32*

*Returns:*
1. **token** *of type address*
2. **cap** *of type uint256*


### *function* getParametersHash

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*
1. **_token** *of type address*
2. **_cap** *of type uint256*

*Returns:*
1. **unnamed** *of type bytes32*


