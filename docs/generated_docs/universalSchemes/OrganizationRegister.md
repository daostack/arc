# OrganizationRegister
[see the source](https://github.com/daostack/arc/tree/master/contracts/universalSchemes/OrganizationRegister.sol)

*Code deposit cost: **less than 358000 gas.***

*Execution cost: **less than 20761 gas.***

*Total deploy cost(deposit + execution): **less than 378761 gas.***

> A universal organization registry.

## Constructors
### OrganizationRegister()

*Execution cost: **No bound available.***

**nonpayable**

*Params:*

*Nothing*


## Events
### Promotion(address, address, uint256)
*Params:*

1. **_registry** *of type address*
2. **_org** *of type address*
3. **_amount** *of type uint256*

---
### OwnershipTransferred(address, address)
*Params:*

1. **previousOwner** *of type address*
2. **newOwner** *of type address*

---
### OrgAdded(address, address)
*Params:*

1. **_registry** *of type address*
2. **_org** *of type address*

---
### NewProposal(bytes32)
*Params:*

1. **proposalId** *of type bytes32*


## Fallback
*Nothing*
## Functions
### updateParameters(bytes32)

*Execution cost: **less than 20550 gas.***

**nonpayable**

*Inputs:*

1. **_hashedParameters** *of type bytes32*

*Returns:*

*Nothing*

---
### transferOwnership(address)
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 22961 gas.***

**nonpayable**

*Inputs:*

1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*

*Nothing*

---
### setParameters(address, uint256, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_token** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*

---
### parameters(bytes32)

*Execution cost: **less than 1157 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type bytes32*

*Returns:*

1. **fee** *of type uint256*
2. **token** *of type address*
3. **beneficiary** *of type address*

---
### owner()

*Execution cost: **less than 677 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*

---
### organizationsRegistery(address, address)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **unnamed** *of type address*
2. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type uint256*

---
### hashedParameters()

*Execution cost: **less than 612 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type bytes32*

---
### getParametersHash(address, uint256, address)

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*

1. **_token** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*

---
### addOrPromoteAddress(address, address, uint256)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_avatar** *of type address*
2. **_record** *of type address*
3. **_amount** *of type uint256*

*Returns:*

*Nothing*


