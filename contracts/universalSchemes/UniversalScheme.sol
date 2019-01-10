pragma solidity ^0.5.2;

import "./UniversalSchemeInterface.sol";
import "../controller/ControllerInterface.sol";
import "../controller/Avatar.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract UniversalScheme is Ownable, UniversalSchemeInterface {
    bytes32 public hashedParameters; // For other parameters.

    function updateParameters(
        bytes32 _hashedParameters
    )
        public
        onlyOwner
    {
        hashedParameters = _hashedParameters;
    }

    /**
    *  @dev get the parameters for the current scheme from the controller
    */
    function getParametersFromController(Avatar _avatar) internal view returns(bytes32) {
        require(ControllerInterface(_avatar.owner()).isSchemeRegistered(address(this), address(_avatar)),
        "scheme is not registered");
        return ControllerInterface(_avatar.owner()).getSchemeParameters(address(this), address(_avatar));
    }
}
