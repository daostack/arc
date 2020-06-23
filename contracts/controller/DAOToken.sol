pragma solidity ^0.6.10;
// SPDX-License-Identifier: GPL-3.0

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20Burnable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";


/**
 * @title DAOToken, base on zeppelin contract.
 * @dev ERC20 compatible token. It is a mintable, burnable token.
 */
contract DAOToken is ERC20BurnableUpgradeSafe, OwnableUpgradeSafe {

    uint256 public cap;

    /**
    * @dev initialize
    * @param _name - token name
    * @param _symbol - token symbol
    * @param _cap - token cap - 0 value means no cap
    */
    function initialize(string calldata _name, string calldata _symbol, uint256 _cap, address _owner)
    external
    initializer {
        cap = _cap;
        __ERC20_init_unchained(_name, _symbol);
        __Ownable_init_unchained();
        transferOwnership(_owner);
    }

    /**
     * @dev Function to mint tokens
     * @param _to The address that will receive the minted tokens.
     * @param _amount The amount of tokens to mint.
     */
    function mint(address _to, uint256 _amount) public onlyOwner returns (bool) {
        if (cap > 0) {
            require(totalSupply().add(_amount) <= cap, "override cap");
        }
        _mint(_to, _amount);
        return true;
    }
}
