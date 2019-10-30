pragma solidity ^0.5.11;

import "../controller/Controller.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";


contract SchemeMock is Initializable {

    Avatar public avatar;
    uint256 public testData;

    function initialize(Avatar _avatar, uint256 _testData)
    external
    initializer {
        avatar = _avatar;
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
