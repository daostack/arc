# DaoCreator
[see the source](https://github.com/daostack/arc/tree/master/contracts/universalSchemes/DaoCreator.sol)
> Genesis Scheme that creates organizations


**Execution cost**: less than 22864 gas

**Deployment cost**: less than 2275200 gas

**Combined cost**: less than 2298064 gas

## Constructor



Params:

1. **_controllerCreator** *of type `address`*

## Events
### InitialSchemesSet(address)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*

--- 
### NewOrg(address)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*


## Methods
### forgeOrg(bytes32,string,string,address[],uint256[],uint256[],address,uint256)
>
> Create a new organization


**Execution cost**: No bound available


Params:

1. **_orgName** *of type `bytes32`*

    > The name of the new organization

2. **_tokenName** *of type `string`*

    > The name of the token associated with the organization

3. **_tokenSymbol** *of type `string`*

    > The symbol of the token

4. **_founders** *of type `address[]`*

    > An array with the addresses of the founders of the organization

5. **_foundersTokenAmount** *of type `uint256[]`*

    > An array of amount of tokens that the founders receive in the new organization

6. **_foundersReputationAmount** *of type `uint256[]`*

    > An array of amount of reputation that the  founders receive in the new organization

7. **_uController** *of type `address`*

    > universal controller instance        if _uController address equal to zero the organization will use none universal controller.

8. **_cap** *of type `uint256`*

    > token cap - 0 for no cap.


Returns:

> The address of the avatar of the controller

1. **output_0** *of type `address`*

--- 
### locks(address)


**Execution cost**: less than 739 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **output_0** *of type `address`*

--- 
### setSchemes(address,address[],bytes32[],bytes4[])
>
> Set initial schemes for the organization.


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*

    > organization avatar (returns from forgeOrg)

2. **_schemes** *of type `address[]`*

    > the schemes to register for the organization

3. **_params** *of type `bytes32[]`*

    > the schemes's params

4. **_permissions** *of type `bytes4[]`*

    > the schemes permissions.



[Back to the top ↑](#daocreator)
