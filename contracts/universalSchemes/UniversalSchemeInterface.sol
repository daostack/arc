pragma solidity ^0.4.18;

import "../controller/Controller.sol";
import "../controller/Avatar.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/token/StandardToken.sol";


contract UniversalSchemeInterface {

    function updateParameters(StandardToken _nativeToken, uint _fee, address _beneficiary, bytes32 _hashedParameters) public;

    function registerOrganization(AvatarInterface _avatar) public;

    function getParametersFromController(AvatarInterface _avatar) internal constant returns(bytes32);
}
