The *Genesis Scheme* is a special scheme that creates a brand new DAO and initializes it with a set of default *Schemes*.
It is the main way to create new DAOs on the DAOStack.

## Usage

### Step 1: Create the organization
```
GenesisScheme gs = new GenesisScheme();
address avatar = 
    gs.forgeOrg(
        "Organization name",
        "Token name",
        "TKN", /*Token symbol*/
        [me,you], /*founders addresses*/
        [5,7], /*founders initial token allocation*/
        [10,12], /*founders initial reputation allocation*/
    );
```

### Step 2: Configure some schemes
```
ContributionReward crScheme = new ContributionReward();
bytes32 paramsHash = crScheme.setParameters(...);

bytes4 permission = 0; /* set to zero = no special permissions */
    /* permission is a 4 bit number indicating what kind of operations can the scheme do in this organization:
        1st bit - irrelevent to us.
        2nd bit - can register other schemes.
        3rd bit - can add/remove global constraints.
        4th bit - can upgrade controller. 
    */
```
### Step 3: Register schemes with the organization
```
gs.setSchemes(
    Avatar(avatar),
    [address(crSchemes)], /* schemes to regsiter*/
    [paramsHash], /* params hash */
    [true], /* is the scheme a universal scheme */
    [permission] 
);
```