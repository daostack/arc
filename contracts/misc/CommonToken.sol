pragma solidity ^0.6.12;
// SPDX-License-Identifier: GPL-3.0

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";


/**
 * @title CommonToken, base on zeppelin contract.
 * @dev ERC20 compatible token. It is a mintable, burnable token(onlyOwner)
 */
contract CommonToken is ERC20UpgradeSafe, OwnableUpgradeSafe {

    /**
    * @dev initialize
    * @param _name - token name
    * @param _symbol - token symbol
    * @param _owner - token owner
    */
    function initialize(string calldata _name, string calldata _symbol, address _owner)
    external
    initializer {
        __ERC20_init_unchained(_name, _symbol);
        __Ownable_init_unchained();
        transferOwnership(_owner);
    }

    /**
     * @dev Destroys `amount` tokens from the caller.
     *
     * See {ERC20-_burn}.
     */
    function burn(address _account, uint256 _amount) public onlyOwner {
        _burn(_account, _amount);
    }

    /**
     * @dev Destroys `amount` tokens from the caller.
     *
     * See {ERC20-_burn}.
     */
    function mint(address _account, uint256 _amount) public onlyOwner {
        _mint(_account, _amount);
    }
}
