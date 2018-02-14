# Controller
[see the generated documentation](../../generated_docs/controller/Controller.md)

The controller is the central entity of a DAO.

Each DAO has it's own deployed instance of this contracts (see [UController](UController.md) for a different possibility),
which acts as the owner of the DAO's [Avatar](./Avatar.md), [Reputation](Reputation.md) and [DAOToken](DAOToken.md).

It can perform "sensitive"operations through these entities (e.g token and reputation operations).

It is subject to a set of *Schemes* and *Constraints* that determine its behavior, where each scheme has it own operations permissions.

It stores scheme's parameters for the specific DAO.

The [Controller](../../generated_docs/controller/Controller.md) contract implements the [ControllerInterface](../../generated_docs/controller/ControllerInterface.md) Interface.


## Schemes

A single DAO controller might be a subject to multiple schemes, each with it's own logic.
A scheme can only be registered to a controller by a scheme which has registration permission.


### Permissions

The controller holds and enforces the permissions for each scheme.
e.g [registerScheme(...)](../../generated_docs/controller/ControllerInterface/#registerschemeaddressbytes32bytes4address) is allowed to be called only by an authorized (with permission: `CAN_REGISTER`) scheme.

A scheme can have any combination of the following permissions:

 - `REGISTERED` -  All registered schemes has this permission. Only registered schemes can perform controller operations.
 - `CAN_REGISTER` - Grant the scheme the permission to register other schemes.
 - `ADD_OR_REMOVE_GLOBAL_CONSTRAINT` - Grant the scheme the permission to add or remove a global constraint.
 - `CAN_UPGRADE` - Grant the scheme the permission to upgrade the controller.

### Parameters

The controller holds the hash of a parameters set for each scheme.

This way a scheme can define a set of parameters which are specific for an organization(defined by the controller).

## Global constraints

A controller maintains and enforces global constraints for the organization.

A constraint define what a "cannot be done" in the DAO. e.g limit the number of minted tokens for the DAO.

The global constraints is checked before and after each controller operation.

Only a scheme with the `ADD_OR_REMOVE_GLOBAL_CONSTRAINT` permission can add or remove a global constraint.
