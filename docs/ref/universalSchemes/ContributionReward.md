# *contract* ContributionReward
A scheme for proposing and rewarding contributions to an organization
## Events
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

### *event* LogProposalExecuted
*Parameters:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*

### *event* LogProposalDeleted
*Parameters:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*

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
2. **bytes32**
3. **uint256**
4. **address**

### *function* organizationsProposals

**constant**
**payable**
**view**




*Inputs:*
1. **unnamed** *of type address* - 
2. **unnamed** *of type bytes32* - 

*Returns:*
1. **bytes32**
2. **uint256**
3. **uint256**
4. **uint256**
5. **address**
6. **uint256**
7. **address**

### *function* execute

**nonpayable**


execution of proposals, can only be called by the voting machine in which the vote is held.

*Inputs:*
1. **_proposalId** *of type bytes32* - the ID of the voting in the voting machine
2. **_avatar** *of type address* - address of the controller
3. **_param** *of type int256* - a parameter of the voting result, 0 is no and 1 is yes.

*Returns:*
*Nothing*

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

### *function* proposeContributionReward

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

### *function* getParametersHash

**constant**
**payable**
**pure**


return a hash of the given parameters

*Inputs:*
1. **_orgNativeTokenFee** *of type uint256* - the fee for submitting a contribution in organizations native token
2. **_schemeNativeTokenFee** *of type uint256* - the fee for submitting a contribution if paied in schemes native token
3. **_voteApproveParams** *of type bytes32* - parameters for the voting machine used to approve a contribution
4. **_intVote** *of type address* - the voting machine used to approve a contribution

*Returns:*
a hash of the parameters

### *function* setParameters

**nonpayable**


hash the parameters, save them if necessary, and return the hash value

*Inputs:*
1. **_orgNativeTokenFee** *of type uint256* - 
2. **_schemeNativeTokenFee** *of type uint256* - 
3. **_voteApproveParams** *of type bytes32* - 
4. **_intVote** *of type address* - 

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

