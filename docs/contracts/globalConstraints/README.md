# Global Constraints Home

[see the generated documentation](../../generated_docs/globalConstraints/GlobalConstraintInterface.md)

related: [TokenCapGC](TokenCapGC.md)

*Global Constraint*s define certain conditions the DAO must hold at all times. More concretely, they define *pre* & *post* conditions that must hold before & after any action the DAO takes.
They are meant to be *Universal* (i.e. only one deployed instance), but do not strictly need to be.

When an action is about to happen, the [Controller](../controller/Controller.md) consults the *Global Constraint* and runs it's `pre` & `post` methods to see if the conditions hold.
It passes the following parameters to `pre` & `post`:

1. `address scheme` - the scheme that performed the action.
2. `bytes32 hash` - a hash of the parameters to be used.
3. `bytes32 method` - what kind of event occurred, available `method`s:
    - `mintReputation`
    - `mintTokens`
    - `registerScheme`
    - `unregisterScheme`
    - `sendEther`
    - `externalTokenTransfer`
    - `externalTokenTransferFrom`
    - `externalTokenIncreaseApproval`
    - `externalTokenDecreaseApproval`
    - `genericAction` - all other actions.

## Examples

### A simple time-lock constraint for registering schemes

#### Defining it

We are going to define a simple global constraint that disallows registering new *Scheme*s during a certain time period.

```
import '@daostack/arc/contracts/globalConstraints/GlobalConstraintInterface.sol';

contract SchemeRegisterTimeLock is GlobalConstraintInterface{

    /* Define how our parameters look like*/
    struct Params{
        uint start;
        uint end;
    }

    mapping(bytes32=>Params) public params;

    function setParams(uint start, uint end) returns(bytes32){
        bytes32 hash = keccak256(start,end);
        params[hash].start = start;
        params[hash].end = end;
        return hash;
    }

    function pre(address scheme, bytes32 hash, bytes32 method) public returns(bool){
        /* This runs *before* an action is taken */

        /* make sure no registerations occur between `start` and `end`*/
        if(method == "registerScheme"
            && params[hash].start <= now
            && now <= params[hash].end)
                return false;

        return true;
    }

    function post(address scheme, bytes32 hash, bytes32 method) public returns(bool){
        /* This runs *after* an action is taken */
        return true;
    }
}
```

#### Registering it with the controller

Registering a global constraint is done inside a method of a *Scheme* which is permitted to add/remove global constraints.
```
SchemeRegisterTimeLock gc = new SchemeRegisterTimeLock();

/* Somewhere inside a scheme with `ADD_OR_REMOVE_GLOBAL_CONSTRAINT` permission  */
bytes32 hash = gc.setParameters(now,now + 2 days)
contoller.addGlobalConstraint(address(myGlobalConstraint),hash)
```
