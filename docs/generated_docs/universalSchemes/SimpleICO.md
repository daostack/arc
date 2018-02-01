# SimpleICO
[see the source](https://github.com/daostack/daostack/tree/master/contracts/universalSchemes/SimpleICO.sol)

*Code deposit cost: **less than 876400 gas.***

*Execution cost: **less than 21277 gas.***

*Total deploy cost(deposit + execution): **less than 897677 gas.***

> SimpleICO scheme.


## Reference
### Constructors
#### *constructor* SimpleICO()

*Execution cost: **No bound available.***

**nonpayable**

*Params:*

*Nothing*


### Events
#### *event* OwnershipTransferred
*Params:*

1. **previousOwner** *of type address*
2. **newOwner** *of type address*


#### *event* NewProposal
*Params:*

1. **proposalId** *of type bytes32*


#### *event* DonationReceived
*Params:*

1. **organization** *of type address*
2. **_beneficiary** *of type address*
3. **_incomingEther** *of type uint256*
4. **_tokensAmount** *of type uint256*


### Fallback
*Nothing*
### Functions
#### *function* owner

*Execution cost: **less than 721 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*


#### *function* parameters

*Execution cost: **less than 1880 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type bytes32*

*Returns:*

1. **cap** *of type uint256*
2. **price** *of type uint256*
3. **startBlock** *of type uint256*
4. **endBlock** *of type uint256*
5. **beneficiary** *of type address*
6. **admin** *of type address*


#### *function* transferOwnership
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 23049 gas.***

**nonpayable**

*Inputs:*

1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*

*Nothing*


#### *function* updateParameters

*Execution cost: **less than 20572 gas.***

**nonpayable**

*Inputs:*

1. **_hashedParameters** *of type bytes32*

*Returns:*

*Nothing*


#### *function* resumeICO
> Allowing admin to reopen an ICO.

*Execution cost: **less than 21513 gas.***

**nonpayable**

*Inputs:*

1. **_avatar** *of type address- The Avatar's of the organization*

*Returns:*

*Nothing*


#### *function* start
> start an ICO

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_avatar** *of type address- The Avatar's of the organization*

*Returns:*

*Nothing*


#### *function* setParameters

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_cap** *of type uint256*
2. **_price** *of type uint256*
3. **_startBlock** *of type uint256*
4. **_endBlock** *of type uint256*
5. **_beneficiary** *of type address*
6. **_admin** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*


#### *function* organizationsICOInfo

*Execution cost: **less than 1559 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type address*

*Returns:*

1. **paramsHash** *of type bytes32*
2. **avatarContractICO** *of type address*
3. **totalEthRaised** *of type uint256*
4. **isHalted** *of type bool*


#### *function* isActive
> Check is an ICO is active (halted is still considered active). Active ICO: 1. The organization is registered. 2. The ICO didn't reach it's cap yet. 3. The current block isn't bigger than the "endBlock" & Smaller then the "startBlock"

*Execution cost: **less than 3761 gas.***

**constant | view**

*Inputs:*

1. **_avatar** *of type address- The Avatar's of the organization*

bool which represents a successful of the function

#### *function* hashedParameters

*Execution cost: **less than 700 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type bytes32*


#### *function* haltICO
> Allowing admin to halt an ICO.

*Execution cost: **less than 21475 gas.***

**nonpayable**

*Inputs:*

1. **_avatar** *of type address- The Avatar's of the organization*

*Returns:*

*Nothing*


#### *function* getParametersHash

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*

1. **_cap** *of type uint256*
2. **_price** *of type uint256*
3. **_startBlock** *of type uint256*
4. **_endBlock** *of type uint256*
5. **_beneficiary** *of type address*
6. **_admin** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*


#### *function* donate

*Execution cost: **No bound available.***

**payable**

*Inputs:*

1. **_avatar** *of type address*
2. **_beneficiary** *of type address*

*Returns:*

1. **unnamed** *of type uint256*


