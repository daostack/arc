pragma solidity ^0.4.24;

import "../universalSchemes/UniversalScheme.sol";
import "../controller/ControllerInterface.sol";


contract UniversalSchemeMock is UniversalScheme {

    constructor() public {
    }

    function genericCall(address _avatar,address _contract,uint _a,address _b,bytes32 _c)
    public returns(bytes32)
    {

        address controller = Avatar(_avatar).owner();
        return ControllerInterface(controller).genericCall(_contract,abi.encodeWithSignature("test(uint256,address,bytes32)",_a,_b,_c),_avatar);
    }

    function genericCallDirect(address _avatar,address _contract,uint _a,address _b,bytes32 _c)
    public returns(bytes32)
    {
        Avatar(_avatar).genericCall(_contract,abi.encodeWithSignature("test(uint256,address,bytes32)",_a,_b,_c));
        // solium-disable-next-line security/no-inline-assembly
        assembly {
        // Copy the returned data.
        returndatacopy(0, 0, returndatasize)
        return(0, returndatasize)
        }
    }
}
