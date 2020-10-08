pragma solidity 0.5.17;

import "./SchemeConstraints.sol";


contract DxDaoSchemeConstraints is SchemeConstraints {
    using SafeMath for uint256;

    uint256 public initialTimestamp;
    uint256 public periodSize;
    uint256 public periodLimitWei;

    uint256 public periodLimitTokens;
    mapping(uint256=>uint256) periodSpendingTokens;

    mapping(address=>uint256) periodLimitToken;
    mapping (uint256 => mapping(address => uint256)) public periodSpendingToken;
    mapping(uint256=>uint256) periodSpendingWei;

    function initialize(
        uint256 _periodSize,
        uint256 _periodLimitWei
    )
    external {
        require(initialTimestamp == 0, "cannot initialize twice");
        require(_periodSize > 0 , "preriod size should be greater than 0");
        periodSize = _periodSize;
        periodLimitWei = _periodLimitWei;
        initialTimestamp = block.timestamp;
    }

    function isAllowedToCall(
        address _contractToCall,
        bytes calldata _callData,
        Avatar _avatar,
        uint256 _ethAmount)
    external
    returns(bool)
    {

        uint256 observervationIndex = observationIndexOf(block.timestamp);
        require(periodSpendingWei[observervationIndex].add(_ethAmount) <= periodLimitWei, "periodSpendingWeiExceeded");
      //do the logic
        return true;

    }

    function observationIndexOf(uint256 _timestamp) public view returns (uint256) {
        return uint8((_timestamp-initialTimestamp) / periodSize);
    }

}
