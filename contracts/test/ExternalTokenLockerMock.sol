pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract ExternalTokenLockerMock is Ownable {

    // user => amount
    mapping (address => uint) public lockedTokenBalances;

    function lock(uint256 _amount, address _beneficiary) public onlyOwner {
        lockedTokenBalances[_beneficiary] = _amount;
    }
}
