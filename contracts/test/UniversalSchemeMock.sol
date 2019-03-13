pragma solidity ^0.5.4;

import "../universalSchemes/UniversalScheme.sol";
import "../controller/ControllerInterface.sol";


contract UniversalSchemeMock is UniversalScheme {

    function genericCall(Avatar _avatar, address _contract, uint256 _a, address _b, bytes32 _c, uint256 _value)
    public returns(bool, bytes memory)
    {

        address controller = _avatar.owner();
        return ControllerInterface(controller).genericCall(
        _contract, abi.encodeWithSignature("test(uint256,address,bytes32)", _a, _b, _c), _avatar, _value);
    }

    function genericCallDirect(Avatar _avatar, address _contract, uint256 _a, address _b, bytes32 _c, uint256 _value)
    public returns(bool, bytes memory)
    {
        return _avatar.genericCall(
        _contract,
        abi.encodeWithSignature("test(uint256,address,bytes32)", _a, _b, _c),
        _value);
    }
}
