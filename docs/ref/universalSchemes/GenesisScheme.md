# *contract* GenesisScheme
Genesis Scheme that creates organizations
## Events
### *event* NewOrg
*Parameters:*
1. **_avatar** *of type address*

### *event* InitialSchemesSet
*Parameters:*
1. **_avatar** *of type address*

## Functions
### *function* bytes4Array

**constant**
**payable**
**view**




*Inputs:*
1. **unnamed** *of type uint256* - 

*Returns:*
1. **bytes4**

### *function* addressArray

**constant**
**payable**
**view**




*Inputs:*
1. **unnamed** *of type uint256* - 

*Returns:*
1. **address**

### *function* forgeOrg

**nonpayable**


Create a new organization

*Inputs:*
1. **_orgName** *of type bytes32* - The name of the new organization
2. **_tokenName** *of type string* - The name of the token associated with the organization
3. **_tokenSymbol** *of type string* - The symbol of the token
4. **_founders** *of type address[]* - An array with the addresses of the founders of the organization
5. **_foundersTokenAmount** *of type uint256[]* - An array of amount of tokens that the founders receive in the new organization
6. **_foundersReputationAmount** *of type int256[]* - An array of amount of reputation that the  founders receive in the new organization 

*Returns:*
The address of the avatar of the controller

### *function* setSchemes

**nonpayable**


Set initial schemes for the organization.

*Inputs:*
1. **_avatar** *of type address* - organization avatar (returns from forgeOrg)
2. **_schemes** *of type address[]* - the schemes to register for the organization
3. **_params** *of type bytes32[]* - the schemes's params
4. **_isUniversal** *of type bool[]* - is this scheme is universal scheme (true or false)
5. **_permissions** *of type bytes4[]* - the schemes permissins.

*Returns:*
*Nothing*

### *function* bytes32Array

**constant**
**payable**
**view**




*Inputs:*
1. **unnamed** *of type uint256* - 

*Returns:*
1. **bytes32**

