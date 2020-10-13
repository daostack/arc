pragma solidity 0.5.17;
pragma experimental ABIEncoderV2;

import "./SchemeConstraints.sol";


contract DxDaoSchemeConstraints is SchemeConstraints {
    using SafeMath for uint256;

    uint256 public initialTimestamp;
    uint256 public periodSize;
    uint256 public periodLimitWei;

    mapping(address=>uint256) public periodLimitToken;
    mapping (uint256 => mapping(address => uint256)) public periodSpendingToken;
    mapping(uint256=>uint256) public periodSpendingWei;
    mapping(address=>bool) public contractsWhiteListMap;
    bytes4 private constant APPROVE_SIGNATURE = 0x095ea7b3;//approve(address,uint256)

    /* @dev initialize
     * @param _periodSize the time period to limit the tokens and eth spending
     * @param _periodLimitWei the limit of eth which can be sent per period
     * @param _periodLimitTokensAddresses tokens to limit
     * @param _periodLimitTokensAmounts the limit of token which can be sent per period
     * @param _contractsWhiteList the contracts the scheme is allowed to interact with
     */
    function initialize(
        uint256 _periodSize,
        uint256 _periodLimitWei,
        address[] calldata _periodLimitTokensAddresses,
        uint256[] calldata _periodLimitTokensAmounts,
        address[] calldata _contractsWhiteList
    )
    external {
        require(initialTimestamp == 0, "cannot initialize twice");
        require(_periodSize > 0, "preriod size should be greater than 0");
        require(_periodLimitTokensAddresses.length == _periodLimitTokensAmounts.length,
        "invalid length _periodLimitTokensAddresses");
        periodSize = _periodSize;
        periodLimitWei = _periodLimitWei;
        // solhint-disable-next-line not-rely-on-time
        initialTimestamp = block.timestamp;
        for (uint i = 0; i < _contractsWhiteList.length; i++) {
            contractsWhiteListMap[_contractsWhiteList[i]] = true;
        }
        for (uint i = 0; i < _periodLimitTokensAmounts.length; i++) {
            periodLimitToken[_periodLimitTokensAddresses[i]] = _periodLimitTokensAmounts[i];
        }
        contractsWhiteList = _contractsWhiteList;
    }

    /*
     * @dev isAllowedToCall should be called upon a proposal execution.
     *  - check that the total spending of tokens within a 'periodSize' does not exceed the periodLimit per token
     *  - check that the total sending of eth within a 'periodSize' does not exceed the periodLimit
     * @param _contractsToCall the contracts to be called
     * @param _callsData - The abi encode data for the calls
     * @param _values value(ETH) to transfer with the calls
     * @param _avatar avatar
     * @return bool value true-allowed false not allowed
     */
    function isAllowedToCall(
        address[] calldata _contractsToCall,
        bytes[] calldata _callsData,
        uint256[] calldata _values,
        Avatar
    )
    external
    returns(bool)
    {

        uint256 observervationIndex = observationIndex();
        uint256 totalPeriodSpendingInWei;
        for (uint i = 0; i < _contractsToCall.length; i++) {
        // constraint eth transfer
            totalPeriodSpendingInWei = totalPeriodSpendingInWei.add(_values[i]);
            bytes memory callData = _callsData[i];
        // constraint approve calls
            if (callData[0] == APPROVE_SIGNATURE[0] &&
                callData[1] == APPROVE_SIGNATURE[1] &&
                callData[2] == APPROVE_SIGNATURE[2] &&
                callData[3] == APPROVE_SIGNATURE[3]) {
                uint256 amount;
                address contractToCall = _contractsToCall[i];
                // solhint-disable-next-line no-inline-assembly
                assembly {
                    amount := mload(add(callData, 68))
                }
                periodSpendingToken[observervationIndex][contractToCall] =
                periodSpendingToken[observervationIndex][contractToCall].add(amount);
                require(
                periodSpendingToken[observervationIndex][contractToCall] <= periodLimitToken[contractToCall],
                "periodSpendingTokensExceeded");
            }

        }
        periodSpendingWei[observervationIndex] =
        periodSpendingWei[observervationIndex].add(totalPeriodSpendingInWei);
        require(periodSpendingWei[observervationIndex] <= periodLimitWei, "periodSpendingWeiExceeded");
        return true;
    }

    /*
     * @dev isAllowedToPropose should be called upon a proposal submition.
     * allow only whitelisted target contracts or 'approve' calls which the 'spender' is whitelisted
     * @param _contractsToCall the contracts to be called
     * @param _callsData - The abi encode data for the calls
     * @param _values value(ETH) to transfer with the calls
     * @param _avatar avatar
     * @return bool value true-allowed false not allowed
     */
    function isAllowedToPropose(
        address[] calldata _contractsToCall,
        bytes[] calldata _callsData,
        uint256[] calldata,
        Avatar)
    external
    returns(bool)
    {
        for (uint i = 0; i < _contractsToCall.length; i++) {
            if (!contractsWhiteListMap[_contractsToCall[i]]) {
                address spender;
                bytes memory callData = _callsData[i];
                require(
                    callData[0] == APPROVE_SIGNATURE[0] &&
                    callData[1] == APPROVE_SIGNATURE[1] &&
                    callData[2] == APPROVE_SIGNATURE[2] &&
                    callData[3] == APPROVE_SIGNATURE[3],
                "allow only approve call for none whitelistedContracts");
                //in solidity > 6 this can be replaced by:
                //(spender,) = abi.descode(callData[4:], (address, uint));
                // see https://github.com/ethereum/solidity/issues/9439
                // solhint-disable-next-line no-inline-assembly
                assembly {
                    spender := mload(add(callData, 36))
                }
                require(contractsWhiteListMap[spender], "spender contract not whitelisted");
            }
        }
        return true;
    }

    function observationIndex() public view returns (uint256) {
        // solhint-disable-next-line not-rely-on-time
        return ((block.timestamp - initialTimestamp) / periodSize);
    }

}
