# UController

The universal controller behave like a [controller](Controller.md) for multiple DAOs.

Any DAO can initiate and register it self via the universal controller.

As a controller it holds the DAOs organs ( [Avatar](./Avatar.md),[Reputation](Reputation.md) and [DAOToken](DAOToken.md)), maintain schemes permissions and global constraints for each DAOs.

The universal controller is aligned with the ControllerInterface.

## newOrganization function

Using newOrganization function , one can create a new organization with a default scheme with full permissions.

## UNIVERSAL vs SINGLE CONTROLLER

- UNIVERSAL CONTROLLER will probably will be deployed by DAOstack so by using it
   one save the gas cost of deploying a controller when creating a DAO.
   
- UNIVERSAL CONTROLLER might be a bit expensive in terms of GAS for each operation. 
