pragma solidity ^0.5.2;

import "../token/ERC827/ERC827Token.sol";

// mock class using ERC827 Token


contract ERC827TokenMock is ERC827Token {

    constructor(address initialAccount, uint256 initialBalance) public {
        _mint(initialAccount, initialBalance);
    }

}
