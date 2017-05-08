pragma solidity ^0.4.11;

import "../controller/Controller.sol"; // Should change to controller intreface.

contract Scheme {
  Controller  public      controller;
  bool        public      isRegistered;

  event Registered (Controller _controller);
  event Unregistered (Controller _controller);
  event controllerUpdate (Controller _controller);

  function Scheme (Controller _controller) {
    controller = _controller;
    controller.proposeScheme(this); // Maybe need to add here an address to collect fee from.
  }

  function registered () onlyController {
    isRegistered = true;
    Registered(controller);
  }

  function unregistered () onlyController {
    isRegistered = false;
  }

  function updateController () {
    require(controller.updatedController); // Need to test if this is the right syntax.
    controller = controller.updatedController;
    controllerUpdate(controller);
  }

  modifier onlyController {
    require(msg.sender == controller);
    _;
  }

  modifier isSchemeRegistered {
    require(isRegistered);
    _;
  }
}
