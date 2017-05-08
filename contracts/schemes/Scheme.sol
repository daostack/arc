pragma solidity ^0.4.11;

import "../controller/Controller.sol"; // Should change to controller intreface.
import "./GenesisScheme.sol";

contract Scheme {
  Controller      public      controller;
  GenesisScheme   public      genesis;
  bool            public      isRegistered;

  event Registered (Controller _controller);
  event Unregistered (Controller _controller);
  event controllerUpdate (Controller _controller);

  function Scheme (Controller _controller) {
    controller = _controller;
    genesis = GenesisScheme(controller.genesisAddress());
    genesis.proposeScheme(this); // Maybe need to add here an address to collect fee from.
  }

  function registered () onlyController {
    isRegistered = true;
    Registered(controller);
  }

  function unregistered () onlyController {
    isRegistered = false;
  }

  function updateController () {
    require(controller.updatedController() != address(0)); // Need to test if this is the right syntax.
    controller = Controller(controller.updatedController());
    controllerUpdate(controller);
  }

  modifier onlyController {
    require(msg.sender == address(controller));
    _;
  }

  modifier isSchemeRegistered {
    require(isRegistered);
    _;
  }
}
