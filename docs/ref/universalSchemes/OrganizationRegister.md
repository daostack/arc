# *contract* OrganizationRegister
A universal organization registry.
## Events
### *event* OrgAdded
*Parameters:*
1. **_registry** *of type address*
2. **_org** *of type address*

### *event* Promotion
*Parameters:*
1. **_registry** *of type address*
2. **_org** *of type address*
3. **_amount** *of type uint256*

### *event* OrganizationRegistered
*Parameters:*
1. **_avatar** *of type address*

### *event* LogNewProposal
*Parameters:*
1. **proposalId** *of type bytes32*

### *event* OwnershipTransferred
*Parameters:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*

## Functions
### *function* parameters

**constant**
**payable**
**view**




*Inputs:*
1. **unnamed** *of type bytes32* - 

*Returns:*
1. **uint256**
2. **address**
3. **address**

### *function* addOrPromoteAddress

**nonpayable**


Adding or promoting an address on the registry.     An address(record) to add or promote can be organization address or any contract address.     Adding a record is done by paying at least the minimum required by the registery params.     Promoting a record is done by paying(adding)amount of token to the registery beneficiary.

*Inputs:*
1. **_avatar** *of type address* - The _avatar of the organization which own the registery.
2. **_record** *of type address* - The address to add or promote.
3. **_amount** *of type uint256* - amount to pay for adding or promoting

*Returns:*
*Nothing*

### *function* organizationsRegistery

**constant**
**payable**
**view**




*Inputs:*
1. **unnamed** *of type address* - 
2. **unnamed** *of type address* - 

*Returns:*
1. **uint256**

### *function* beneficiary

**constant**
**payable**
**view**




*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* updateParameters

**nonpayable**




*Inputs:*
1. **_nativeToken** *of type address* - 
2. **_fee** *of type uint256* - 
3. **_beneficiary** *of type address* - 
4. **_hashedParameters** *of type bytes32* - 

*Returns:*
*Nothing*

### *function* organizations

**constant**
**payable**
**view**




*Inputs:*
1. **unnamed** *of type address* - 

*Returns:*
1. **bool**

### *function* owner

**constant**
**payable**
**view**




*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* setParameters

**nonpayable**


Hash the parameters,save if needed and return the hash value

*Inputs:*
1. **_token** *of type address* - -  the token to pay for register or promotion an address.
2. **_fee** *of type uint256* - - fee needed for register an address.
3. **_beneficiary** *of type address* - - the beneficiary payment address

*Returns:*
bytes32 -the parameters hash

### *function* registerOrganization

**nonpayable**




*Inputs:*
1. **_avatar** *of type address* - 

*Returns:*
*Nothing*

### *function* getParametersHash

**constant**
**payable**
**pure**


Hash the parameters,and return the hash value

*Inputs:*
1. **_token** *of type address* - -  the token to pay for register or promotion an address.
2. **_fee** *of type uint256* - - fee needed for register an address.
3. **_beneficiary** *of type address* - - the beneficiary payment address

*Returns:*
bytes32 -the parameters hash

### *function* isRegistered

**constant**
**payable**
**view**




*Inputs:*
1. **_avatar** *of type address* - 

*Returns:*
1. **bool**

### *function* fee

**constant**
**payable**
**view**




*Inputs:*
*Nothing*

*Returns:*
1. **uint256**

### *function* nativeToken

**constant**
**payable**
**view**




*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* transferOwnership

**nonpayable**


Allows the current owner to transfer control of the contract to a newOwner.

*Inputs:*
1. **newOwner** *of type address* - The address to transfer ownership to.

*Returns:*
*Nothing*

### *function* hashedParameters

**constant**
**payable**
**view**




*Inputs:*
*Nothing*

*Returns:*
1. **bytes32**

