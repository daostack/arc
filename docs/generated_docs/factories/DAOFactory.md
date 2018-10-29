# DAOFactory
[see the source](https://github.com/daostack/arc/tree/master/contracts/factories/DAOFactory.sol)
> DAO factory that creates new DAOs


**Execution cost**: less than 42082 gas

**Deployment cost**: less than 1344200 gas

**Combined cost**: less than 1386282 gas

## Constructor



Params:

1. **_controllerFactory** *of type `address`*
2. **_actorsFactory** *of type `address`*

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
### addFounders(address,address[],uint256[],uint256[])
>
> addFounders add founders to the organization.     this function can be called only after forgeOrg and before setSchemes


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*

    > the organization avatar

2. **_founders** *of type `address[]`*

    > An array with the addresses of the founders of the organization

3. **_foundersTokenAmount** *of type `uint256[]`*

    > An array of amount of tokens that the founders receive in the new organization

4. **_foundersReputationAmount** *of type `uint256[]`*

    > An array of amount of reputation that the  founders receive in the new organization


Returns:

> bool true or false

1. **output_0** *of type `bool`*

--- 
### forgeOrg(string,string,string,address[],uint256[],uint256[],uint256)
>
> Create a new organization


**Execution cost**: No bound available


Params:

1. **_orgName** *of type `string`*

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

7. **_cap** *of type `uint256`*

    > token cap - 0 for no cap.


Returns:

> The address of the avatar of the controller

1. **output_0** *of type `address`*

--- 
### locks(address)


**Execution cost**: less than 794 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **output_0** *of type `address`*

--- 
### setSchemes(address,address[],bytes4[])
>
> Set initial schemes for the organization.


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*

    > organization avatar (returns from forgeOrg)

2. **_schemes** *of type `address[]`*

    > the schemes to register for the organization

3. **_permissions** *of type `bytes4[]`*

    > the schemes permissions.



[Back to the top ↑](#daofactory)
