# Auction4Reputation
[see the source](https://github.com/daostack/arc/tree/master/contracts/schemes/bootstrapSchemes/Auction4Reputation.sol)
> A scheme for conduct ERC20 Tokens auction for reputation


**Execution cost**: less than 41240 gas

**Deployment cost**: less than 679800 gas

**Combined cost**: less than 721040 gas

## Constructor




## Events
### Bid(address,uint256,uint256)


**Execution cost**: No bound available


Params:

1. **_bidder** *of type `address`*
2. **_auctionId** *of type `uint256`*
3. **_amount** *of type `uint256`*

--- 
### OwnershipRenounced(address)


**Execution cost**: No bound available


Params:

1. **previousOwner** *of type `address`*

--- 
### OwnershipTransferred(address,address)


**Execution cost**: No bound available


Params:

1. **previousOwner** *of type `address`*
2. **newOwner** *of type `address`*

--- 
### Redeem(uint256,address,uint256)


**Execution cost**: No bound available


Params:

1. **_auctionId** *of type `uint256`*
2. **_beneficiary** *of type `address`*
3. **_amount** *of type `uint256`*


## Methods
### auctions(uint256)


**Execution cost**: less than 632 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **totalBid** *of type `uint256`*

--- 
### auctionPeriod()


**Execution cost**: less than 384 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### avatar()


**Execution cost**: less than 735 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### getBid(address,uint256)
>
> getBid get bid for specific bidder and _auctionId


**Execution cost**: less than 740 gas

**Attributes**: constant


Params:

1. **_bidder** *of type `address`*

    > the bidder

2. **_auctionId** *of type `uint256`*

    > auction id


Returns:

> uint

1. **output_0** *of type `uint256`*

--- 
### bid(uint256)
>
> bid function


**Execution cost**: No bound available


Params:

1. **_amount** *of type `uint256`*

    > the amount to bid with


Returns:

> auctionId

1. **auctionId** *of type `uint256`*

--- 
### auctionsStartTime()


**Execution cost**: less than 670 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### auctionReputationReward()


**Execution cost**: less than 406 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### auctionsEndTime()


**Execution cost**: less than 538 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### init(address,address,uint256,uint256,uint256,uint256,address,address)
>
> init


**Execution cost**: No bound available


Params:

1. **_owner** *of type `address`*

    > the owner of the scheme

2. **_avatar** *of type `address`*

    > the avatar to mint reputation from

3. **_reputationReward** *of type `uint256`*

    > the total reputation this contract will reward       for the token locking

4. **_auctionsStartTime** *of type `uint256`*

    > auctions period start time

5. **_auctionsEndTime** *of type `uint256`*

    > auctions period end time.       redeem reputation can be done after this period.       bidding is disable after this time.

6. **_numberOfAuctions** *of type `uint256`*

    > number of auctions.

7. **_token** *of type `address`*

    > the bidding token

8. **_wallet** *of type `address`*


--- 
### numberOfAuctions()


**Execution cost**: less than 494 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### owner()


**Execution cost**: less than 801 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### redeem(address,uint256)
>
> redeem reputation function


**Execution cost**: No bound available


Params:

1. **_beneficiary** *of type `address`*

    > the beneficiary to redeem.

2. **_auctionId** *of type `uint256`*

    > the auction id to redeem from.


Returns:

> bool

1. **output_0** *of type `bool`*

--- 
### renounceOwnership()
>
>Renouncing to ownership will leave the contract without an owner. It will not be possible to call the functions with the `onlyOwner` modifier anymore.
>
> Allows the current owner to relinquish control of the contract.


**Execution cost**: less than 22314 gas




--- 
### reputationRewardLeft()


**Execution cost**: less than 692 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### token()


**Execution cost**: less than 889 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### transferOwnership(address)
>
> Allows the current owner to transfer control of the contract to a newOwner.


**Execution cost**: less than 23090 gas


Params:

1. **_newOwner** *of type `address`*

    > The address to transfer ownership to.



--- 
### wallet()


**Execution cost**: less than 669 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

[Back to the top ↑](#auction4reputation)
