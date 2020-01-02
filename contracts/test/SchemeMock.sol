pragma solidity 0.5.15;

import "../libs/DAOCallerHelper.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";


contract SchemeMock is Initializable {
    using DAOCallerHelper for DAO;

    DAO public dao;
    uint256 public testData;

    function initialize(DAO _dao, uint256 _testData)
    external
    initializer {
        dao = _dao;
        testData = _testData;
    }

    function genericCall(DAO _dao, address _contract, uint256 _a, address _b, bytes32 _c, uint256 _value)
    public returns(bool, bytes memory)
    {
        return _dao.genericCall(
        _contract, abi.encodeWithSignature("test(uint256,address,bytes32)", _a, _b, _c), _value);
    }

    function genericCallDirect(DAO _dao, address _contract, uint256 _a, address _b, bytes32 _c, uint256 _value)
    public returns(bool, bytes memory)
    {
        return _dao.genericCall(
        _contract,
        abi.encodeWithSignature("test(uint256,address,bytes32)", _a, _b, _c),
        _value);
    }
}
