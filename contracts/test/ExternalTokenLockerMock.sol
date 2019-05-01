pragma solidity ^0.5.4;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract ExternalTokenLockerMock is Ownable {

    // user => amount
    mapping (address => uint256) public lockedTokenBalances;

    function lock(uint256 _amount, address _beneficiary) public onlyOwner {
        lockedTokenBalances[_beneficiary] = _amount;
    }

    function balanceOf(address _beneficiary) public view returns(uint256) {
        return lockedTokenBalances[_beneficiary];
    }
}
