pragma solidity ^0.4.25;

import "./UniversalSchemeInterface.sol";
import "../controller/ControllerInterface.sol";
import "../controller/Avatar.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";


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
        return ControllerInterface(_avatar.owner()).getSchemeParameters(this,address(_avatar));
    }
}
