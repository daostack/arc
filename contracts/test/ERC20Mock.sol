pragma solidity ^0.6.10;
// SPDX-License-Identifier: GPL-3.0

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol";


// mock class using ERC20
contract ERC20Mock is ERC20 {

    constructor(address initialAccount, uint256 initialBalance) public {
        _mint(initialAccount, initialBalance);
    }
}
