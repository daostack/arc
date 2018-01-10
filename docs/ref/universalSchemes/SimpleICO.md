# *contract* SimpleICO
SimpleICO scheme.
## Events
### *event* DonationReceived
*Parameters:*
1. **organization** *of type address*
2. **_beneficiary** *of type address*
3. **_incomingEther** *of type uint256*
4. **_tokensAmount** *of type uint256*

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
2. **uint256**
3. **uint256**
4. **uint256**
5. **address**
6. **address**

### *function* setParameters

**nonpayable**


Hash the parameters, save them if necessary, and return the hash value

*Inputs:*
1. **_cap** *of type uint256* - the ico cap
2. **_price** *of type uint256* - represents Tokens per 1 Eth
3. **_startBlock** *of type uint256* - ico start block
4. **_endBlock** *of type uint256* - ico end
5. **_beneficiary** *of type address* - the ico ether beneficiary
6. **_admin** *of type address* - the address of the ico admin which can hald and resume the ICO.

*Returns:*
bytes32 -the params hash

### *function* donate

**payable**


Donating ethers to get tokens. If the donation is higher than the remaining ethers in the "cap", The donator will get the change in ethers.

*Inputs:*
1. **_avatar** *of type address* - The Avatar's of the organization.
2. **_beneficiary** *of type address* - The donator's address - which will receive the ICO's tokens.

*Returns:*
bool which represents a successful of the function

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

### *function* organizationsICOInfo

**constant**
**payable**
**view**




*Inputs:*
1. **unnamed** *of type address* - 

*Returns:*
1. **bytes32**
2. **address**
3. **uint256**
4. **bool**

### *function* getParametersHash

**constant**
**payable**
**pure**


Hash the parameters and return the hash value

*Inputs:*
1. **_cap** *of type uint256* - the ico cap
2. **_price** *of type uint256* - represents Tokens per 1 Eth
3. **_startBlock** *of type uint256* - ico start block
4. **_endBlock** *of type uint256* - ico end
5. **_beneficiary** *of type address* - the ico ether beneficiary
6. **_admin** *of type address* - the address of the ico admin which can hald and resume the ICO.

*Returns:*
bytes32 -the params hash

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

### *function* registerOrganization

**nonpayable**




*Inputs:*
1. **_avatar** *of type address* - 

*Returns:*
*Nothing*

### *function* isActive

**constant**
**payable**
**view**


Check is an ICO is active (halted is still considered active). Active ICO: 1. The organization is registered. 2. The ICO didn't reach it's cap yet. 3. The current block isn't bigger than the "endBlock" & Smaller then the "startBlock"

*Inputs:*
1. **_avatar** *of type address* - The Avatar's of the organization

*Returns:*
bool which represents a successful of the function

### *function* haltICO

**nonpayable**


Allowing admin to halt an ICO.

*Inputs:*
1. **_avatar** *of type address* - The Avatar's of the organization

*Returns:*
*Nothing*

### *function* isRegistered

**constant**
**payable**
**view**




*Inputs:*
1. **_avatar** *of type address* - 

*Returns:*
1. **bool**

### *function* start

**nonpayable**


start an ICO

*Inputs:*
1. **_avatar** *of type address* - The Avatar's of the organization

*Returns:*
*Nothing*

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

### *function* resumeICO

**nonpayable**


Allowing admin to reopen an ICO.

*Inputs:*
1. **_avatar** *of type address* - The Avatar's of the organization

*Returns:*
*Nothing*

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

