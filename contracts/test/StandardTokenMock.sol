pragma solidity ^0.4.25;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";


// mock class using StandardToken
contract StandardTokenMock is StandardToken {

    constructor(address initialAccount, uint256 initialBalance) public {
        balances[initialAccount] = initialBalance;
        totalSupply_ = initialBalance;
    }
}
