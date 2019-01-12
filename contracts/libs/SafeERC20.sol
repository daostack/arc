/*

badERC20 POC Fix by SECBIT Team

USE WITH CAUTION & NO WARRANTY

REFERENCE & RELATED READING
- https://github.com/ethereum/solidity/issues/4116
- https://medium.com/@chris_77367/explaining-unexpected-reverts-starting-with-solidity-0-4-22-3ada6e82308c
- https://medium.com/coinmonks/missing-return-value-bug-at-least-130-tokens-affected-d67bf08521ca
- https://gist.github.com/BrendanChou/88a2eeb80947ff00bcf58ffdafeaeb61

*/
pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/utils/Address.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

library SafeERC20 {
    using Address for address;

    function handleReturnData(bytes memory returnValue) internal pure returns (bool result) {
        if (returnValue.length == 0) {
            result = true;
        } else if (returnValue.length == 32) {
          // solhint-disable-next-line no-inline-assembly
            assembly {
            result := mload(add(returnValue, 32))
            }
        } else {
            revert();
        }
    }

    function safeTransfer(address _erc20Addr, address _to, uint256 _value) internal {

        // Must be a contract addr first!
        require(_erc20Addr.isContract());

        // call return false when something wrong
        (bool success, bytes memory returnValue) =
        // solhint-disable-next-line avoid-low-level-calls
        _erc20Addr.call(abi.encodeWithSignature("transfer(address,uint256)", _to, _value));
        require(success);

        // handle returndata
        require(handleReturnData(returnValue));
    }

    function safeTransferFrom(address _erc20Addr, address _from, address _to, uint256 _value) internal {

        // Must be a contract addr first!
        require(_erc20Addr.isContract());

        // call return false when something wrong
        (bool success, bytes memory returnValue) =
        // solhint-disable-next-line avoid-low-level-calls
        _erc20Addr.call(abi.encodeWithSignature("transferFrom(address,address,uint256)", _from, _to, _value));
        require(success);

        // handle returndata
        require(handleReturnData(returnValue));
    }

    function safeApprove(address _erc20Addr, address _spender, uint256 _value) internal {

        // Must be a contract addr first!
        require(_erc20Addr.isContract());

        // safeApprove should only be called when setting an initial allowance,
        // or when resetting it to zero.
        require((_value == 0) || (IERC20(_erc20Addr).allowance(msg.sender, _spender) == 0));

        // call return false when something wrong
        (bool success, bytes memory returnValue) =
        // solhint-disable-next-line avoid-low-level-calls
        _erc20Addr.call(abi.encodeWithSignature("approve(address,uint256)", _spender, _value));
        require(success);

        // handle returndata
        require(handleReturnData(returnValue));
    }
}
