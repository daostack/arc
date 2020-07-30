pragma solidity ^0.6.12;
// SPDX-License-Identifier: GPL-3.0

import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";


contract ExternalTokenLockerMock is OwnableUpgradeSafe {

    // user => amount
    mapping (address => uint256) public lockedTokenBalances;

    /**
    * @dev initialize
    * @param _owner contract owner
    */
    function initialize(address _owner)
    public
    initializer {
        __Ownable_init_unchained();
        transferOwnership(_owner);
    }

    function lock(uint256 _amount, address _beneficiary) public onlyOwner {
        lockedTokenBalances[_beneficiary] = _amount;
    }

    function balanceOf(address _beneficiary) public view returns(uint256) {
        return lockedTokenBalances[_beneficiary];
    }
}
