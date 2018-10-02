pragma solidity ^0.4.24;

import "@optionality.io/clone-factory/contracts/CloneFactory.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "../controller/Controller.sol";
import "../controller/Avatar.sol";


contract ControllerFactory is Ownable, CloneFactory {

    address public controllerLibraryAddress;

    event ControllerCreated(address newControllerAddress);

    constructor (address _controllerLibraryAddress) public {
        controllerLibraryAddress = _controllerLibraryAddress;
    }

    function createController(Avatar _avatar) public returns (address) {
        address clone = createClone(controllerLibraryAddress);
        Controller(clone).init(msg.sender, _avatar);
        
        emit ControllerCreated(clone);
        
        return clone;
    }
}