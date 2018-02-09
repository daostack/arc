# Controller
[see the generated documentation](../../generated_docs/controller/Controller.md)

The controller is the central entity of a DAO.

As the owner of the DAO's [Avatar](./Avatar.md),[Reputation](Reputation.md) and [DAOToken](DAOToken.md) (organs) it controls these organs and can perform "sensitive"
operations trough these entities (e.g token and reputation operations).

It is subject to a set of schemes and constraints that determine its behavior, where each scheme has it own operations permissions.

It store scheme's parameters for the specific DAO.

The controller contract is aligned with the ControllerInterface.


## Schemes

A single DAO controller might be a subject to multiple schemes, each implements its own logic.
A scheme can be registered to a controller by a scheme which has registration permission.


### Permissions

The controller holds and enforces the permissions for each scheme.
e.g registerScheme is allowed to be called only by authorized (CAN_REGISTERED) scheme.

A scheme can have any combination of the following permissions  :
 - REGISTERED -  All registered schemes has this permission.
                 Only registered schemes can perform controller operations.
 - CAN_REGISTER - grant the scheme the permission to register other schemes.
 - ADD_OR_REMOVE_GLOBAL_CONSTRAINT - grant the scheme the permission to add or remove a global constraint.
 - CAN_UPGRADE - grant the scheme the permission to upgrade the controller.

### Parameters

The controller holds the hash of a parameters set for each scheme.

This way a scheme can define a set of parameters which are specific for an organization(defined by the controller).

## Global constraints

A controller maintains and enforces global constraints for the organization.

A constraint define what a "cannot be done" in the DAO. e.g limit the number of minted tokens for the DAO.

The global constraints is check before each and after controller operations.

Only a scheme which grant ADD_OR_REMOVE_GLOBAL_CONSTRAINT permission can add or remove global constraint.
