# *contract* TokenCapGC
Token Cap Global Constraint

- [Events](#events)

- [Functions](#functions)
    - [setParameters](#function-setparameters)
    - [pre](#function-pre)
    - [post](#function-post)
    - [params](#function-params)
    - [getParametersHash](#function-getparametershash)

## Events

## Functions
### *function* setParameters
**nonpayable**

adding a new set of parametrs
*Inputs:*
1. **_token** *of type address* - the token to add to the params.
2. **_cap** *of type uint256* - the cap to check the total supply against.

*Returns:*
the calculated parameters hash

### *function* pre
**constant**
**payable**
**pure**

check the constraint after the action. This global contraint only checks the state after the action, so here we just return true:
*Inputs:*
1. **unnamed** *of type address*
2. **unnamed** *of type bytes32*
3. **unnamed** *of type bytes*

*Returns:*
true

### *function* post
**constant**
**payable**
**view**

check the total supply cap.
*Inputs:*
1. **unnamed** *of type address* - undefined
2. **_paramsHash** *of type bytes32* - the parameters hash to check the total supply cap against.
3. **unnamed** *of type bytes* - undefined

*Returns:*
bool which represents a success

### *function* params
**constant**
**payable**
**view**

*Inputs:*
1. **unnamed** *of type bytes32*

*Returns:*
1. **address**
2. **uint256**

### *function* getParametersHash
**constant**
**payable**
**pure**

calculate and returns the hash of the given parameters
*Inputs:*
1. **_token** *of type address* - the token to add to the params.
2. **_cap** *of type uint256* - the cap to check the total supply against.

*Returns:*
the calculated parameters hash

