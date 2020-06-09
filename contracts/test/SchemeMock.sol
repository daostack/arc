pragma solidity ^0.5.17;

import "../controller/Controller.sol";
import "../schemes/ArcScheme.sol";
import "../utils/DAOFactory.sol";


contract SchemeMock is ArcScheme {

    uint256 public testData;

    // function initialize(Avatar _avatar, uint256 _testData)
    // external {
    //     super._initialize(_avatar);
    //     testData = _testData;
    // }

    function initialize(
        Avatar _avatar,
        uint256[11] calldata _votingParams,
        address _voteOnBehalf,
        DAOFactory _daoFactory,
        address _stakingToken,
        uint64[3] calldata _packageVersion,
        string calldata _votingMachineName,
        uint256 _testData
    )
    external {
        super._initializeGovernance(
            _avatar,
            _votingParams,
            _voteOnBehalf,
            _daoFactory,
            _stakingToken,
            address(this),
            address(this),
            _packageVersion,
            _votingMachineName);
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
