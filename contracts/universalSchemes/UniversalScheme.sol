pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/token/StandardToken.sol";

contract UniversalScheme is Ownable {
  StandardToken     public      nativeToken;
  uint              public      fee;
  address           public      benificiary;
  bytes32           public      hashedParameters; // For other parameters.

  event Registered (address _controller);
  event Unregistered (address _controller);
  event ControllerUpdate (address _controller);

  function updateParameters (StandardToken _nativeToken,
                              uint _fee,
                              address _benificiary,
                              bytes32 _hashedParameters) onlyOwner {
    nativeToken = _nativeToken;
    fee = _fee;
    benificiary = _benificiary;
    hashedParameters = _hashedParameters;
  }
}
