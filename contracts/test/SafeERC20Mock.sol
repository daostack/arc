pragma solidity ^0.5.2;

import "./BadERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "../libs/SafeERC20.sol";


contract SafeERC20Mock {
    using SafeERC20 for address;

    address public token;

    constructor(IERC20 _token) public {
        token = address(_token);
    }

    function transfer(address _to, uint256 _value) public returns(bool) {
        (, bytes memory returnValue) =
        // solhint-disable-next-line avoid-low-level-calls
        token.call(abi.encodeWithSignature("transfer(address,uint256)", _to, _value));
        require(returnValue.length > 0);
    }

    function transferWithFix(address _to, uint256 _value) public returns(bool) {
        token.safeTransfer(_to, _value);
        return true;
    }

    function transferFromWithFix(address _from, address _to, uint256 _value) public returns(bool) {
        token.safeTransferFrom(_from, _to, _value);
        return true;
    }

    function approveWithFix(address _spender, uint256 _value) public returns(bool) {
        token.safeApprove(_spender, _value);
        return true;
    }

}
