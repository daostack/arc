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

  event orgRegistered (address _avatar);

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

  function getParametersFromController(Avatar _avatar) internal constant returns(bytes32) {
     Controller controller = Controller(_avatar.owner());
     return controller.getSchemeParameters(this);
  }
}
