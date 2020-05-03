pragma solidity ^0.5.17;

import "../controller/Controller.sol";
import "../schemes/ArcScheme.sol";


contract SchemeMock is ArcScheme {

    uint256 public testData;

    function initialize(Avatar _avatar, uint256 _testData)
    external {
        super._initialize(_avatar, IntVoteInterface(0), 0, [uint256(0), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], address(0));
        testData = _testData;
    }

    function genericCall(Avatar _avatar, address _contract, uint256 _a, address _b, bytes32 _c, uint256 _value)
    public returns(bool, bytes memory)
    {

        address controller = _avatar.owner();
        return Controller(controller).genericCall(
        _contract, abi.encodeWithSignature("test(uint256,address,bytes32)", _a, _b, _c), _value);
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
