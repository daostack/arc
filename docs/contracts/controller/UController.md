# UController
[see the generated documentation](../../generated_docs/controller/UController.md)

The `UController`(Universal Controller) is a universal implementation of the [ControllerInterface](../../generated_docs/controller/ControllerInterface.md) which behaves like a [Controller](Controller.md), but for multiple DAOs at the same time.

Any DAO can initiate and register itself via the Universal Controller.

As a controller it holds the DAO's organs ([Avatar](./Avatar.md), [Reputation](Reputation.md) and [DAOToken](DAOToken.md)), maintain schemes permissions and global constraints for each DAO.

## [newOrganization(...)](http://127.0.0.1:8000/generated_docs/controller/UController/#neworganizationaddress) function

Using the `newOrganization`(...) function , one can create a new organization with a default scheme with full permissions.
