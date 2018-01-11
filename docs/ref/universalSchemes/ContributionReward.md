# *contract* ContributionReward ([source](https://github.com/daostack/daostack/tree/master/./contracts/universalSchemes/ContributionReward.sol))
*Code deposit gas: **911000***
*Execution gas: **Infinite***
A scheme for proposing and rewarding contributions to an organization

- [Constructors](#constructors)
    - [ContributionReward(address _nativeToken, uint256 _fee, address _beneficiary)](#constructor-contributionrewardaddress-_nativetoken-uint256-_fee-address-_beneficiary)
- [Events](#events)
    - [OwnershipTransferred](#event-ownershiptransferred)
    - [OrganizationRegistered](#event-organizationregistered)
    - [LogProposalExecuted](#event-logproposalexecuted)
    - [LogProposalDeleted](#event-logproposaldeleted)
    - [LogNewProposal](#event-lognewproposal)
    - [LogNewContributionProposal](#event-lognewcontributionproposal)
- [Fallback](#fallback)
- [Functions](#functions)
    - [registerOrganization](#function-registerorganization)
    - [parameters](#function-parameters)
    - [transferOwnership](#function-transferownership)
    - [setParameters](#function-setparameters)
    - [updateParameters](#function-updateparameters)
    - [proposeContributionReward](#function-proposecontributionreward)
    - [owner](#function-owner)
    - [organizationsProposals](#function-organizationsproposals)
    - [organizations](#function-organizations)
    - [nativeToken](#function-nativetoken)
    - [isRegistered](#function-isregistered)
    - [hashedParameters](#function-hashedparameters)
    - [getParametersHash](#function-getparametershash)
    - [fee](#function-fee)
    - [execute](#function-execute)
    - [beneficiary](#function-beneficiary)
## Constructors
### *constructor* ContributionReward(address _nativeToken, uint256 _fee, address _beneficiary)
*Parameters:*
1. **_nativeToken** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*

## Events
### *event* OwnershipTransferred
*Parameters:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*

### *event* OrganizationRegistered
*Parameters:*
1. **_avatar** *of type address*

### *event* LogProposalExecuted
*Parameters:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*

### *event* LogProposalDeleted
*Parameters:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*

### *event* LogNewProposal
*Parameters:*
1. **proposalId** *of type bytes32*

### *event* LogNewContributionProposal
*Parameters:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **_contributionDesciption** *of type bytes32*
5. **_nativeTokenReward** *of type uint256*
6. **_reputationReward** *of type uint256*
7. **_ethReward** *of type uint256*
8. **_externalTokenReward** *of type uint256*
9. **_externalToken** *of type address*
10. **_beneficiary** *of type address*

## Fallback
*Execution gas: **Infinite***

*Nothing*
## Functions
### *function* registerOrganization
*Execution gas: **Infinite***
**nonpayable**

*Inputs:*
1. **_avatar** *of type address*

*Returns:*
*Nothing*

### *function* parameters
*Execution gas: **1381***
**constant**
**view**

*Inputs:*
1. **unnamed** *of type bytes32*

*Returns:*
1. **uint256**
2. **bytes32**
3. **uint256**
4. **address**

### *function* transferOwnership
*Execution gas: **23184***
**nonpayable**

Allows the current owner to transfer control of the contract to a newOwner.
*Inputs:*
1. **newOwner** *of type address* - The address to transfer ownership to.

*Returns:*
*Nothing*

### *function* setParameters
*Execution gas: **81392***
**nonpayable**

hash the parameters, save them if necessary, and return the hash value
*Inputs:*
1. **_orgNativeTokenFee** *of type uint256*
2. **_schemeNativeTokenFee** *of type uint256*
3. **_voteApproveParams** *of type bytes32*
4. **_intVote** *of type address*

*Returns:*
*Nothing*

### *function* updateParameters
*Execution gas: **81324***
**nonpayable**

*Inputs:*
1. **_nativeToken** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*
4. **_hashedParameters** *of type bytes32*

*Returns:*
*Nothing*

### *function* proposeContributionReward
*Execution gas: **Infinite***
**nonpayable**

Submit a proposal for a reward for a contribution:
*Inputs:*
1. **_avatar** *of type address* - Avatar of the organization that the contribution was made for
2. **_contributionDesciptionHash** *of type bytes32* - A hash of the contribution's description
3. **_rewards** *of type uint256[4]* - rewards array:        rewards[0] - Amount of tokens requested        rewards[1] - Amount of reputation requested        rewards[2] - Amount of ETH requested        rewards[3] - Amount of extenral tokens requested
4. **_externalToken** *of type address* - Address of external token, if reward is requested there
5. **_beneficiary** *of type address* - Who gets the rewards

*Returns:*
*Nothing*

### *function* owner
*Execution gas: **743***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* organizationsProposals
*Execution gas: **2282***
**constant**
**view**

*Inputs:*
1. **unnamed** *of type address*
2. **unnamed** *of type bytes32*

*Returns:*
1. **bytes32**
2. **uint256**
3. **uint256**
4. **uint256**
5. **address**
6. **uint256**
7. **address**

### *function* organizations
*Execution gas: **705***
**constant**
**view**

*Inputs:*
1. **unnamed** *of type address*

*Returns:*
1. **bool**

### *function* nativeToken
*Execution gas: **875***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* isRegistered
*Execution gas: **912***
**constant**
**view**

*Inputs:*
1. **_avatar** *of type address*

*Returns:*
1. **bool**

### *function* hashedParameters
*Execution gas: **766***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **bytes32**

### *function* getParametersHash
*Execution gas: **815***
**constant**
**pure**

return a hash of the given parameters
*Inputs:*
1. **_orgNativeTokenFee** *of type uint256* - the fee for submitting a contribution in organizations native token
2. **_schemeNativeTokenFee** *of type uint256* - the fee for submitting a contribution if paied in schemes native token
3. **_voteApproveParams** *of type bytes32* - parameters for the voting machine used to approve a contribution
4. **_intVote** *of type address* - the voting machine used to approve a contribution

*Returns:*
a hash of the parameters

### *function* fee
*Execution gas: **700***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **uint256**

### *function* execute
*Execution gas: **Infinite***
**nonpayable**

execution of proposals, can only be called by the voting machine in which the vote is held.
*Inputs:*
1. **_proposalId** *of type bytes32* - the ID of the voting in the voting machine
2. **_avatar** *of type address* - address of the controller
3. **_param** *of type int256* - a parameter of the voting result, 0 is no and 1 is yes.

*Returns:*
*Nothing*

### *function* beneficiary
*Execution gas: **655***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

