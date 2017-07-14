pragma solidity ^0.4.11;

import "../controller/Controller.sol";
import "../controller/Avatar.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/token/StandardToken.sol";

contract UniversalScheme is Ownable {
  StandardToken     public      nativeToken;
  uint              public      fee;
  address           public      beneficiary;
  bytes32           public      hashedParameters; // For other parameters.

  event Registered (address _avatar);
  event Unregistered (address _avatar);
  event ControllerUpdate (address _avatar);

  function updateParameters(
      StandardToken _nativeToken,
      uint _fee,
      address _beneficiary,
      bytes32 _hashedParameters
  ) onlyOwner {
      nativeToken = _nativeToken;
      fee = _fee;
      beneficiary = _beneficiary;
      hashedParameters = _hashedParameters;
  }

  /**
   *  @dev get the parameters for the current scheme from the controller
   */
  function getParametersFromController(Avatar _avatar) internal constant returns(bytes32) {
     Controller controller = Controller(_avatar.owner());
     return controller.getSchemeParameters(this);
  }
}
