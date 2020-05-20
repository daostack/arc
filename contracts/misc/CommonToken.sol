pragma solidity ^0.5.17;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/StandaloneERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";


/**
 * @title CommonToken, base on zeppelin contract.
 * @dev ERC20 compatible token. It is a mintable, burnable token(onlyMinter)
 */
contract CommonToken is StandaloneERC20 {

    /**
     * @dev Destroys `amount` tokens from the caller.
     *
     * See {ERC20-_burn}.
     */
    function burn(address _account, uint256 _amount) public onlyMinter {
        _burn(_account, _amount);
    }
}
