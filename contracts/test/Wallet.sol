pragma solidity ^0.6.10;
// SPDX-License-Identifier: GPL-3.0
import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";


contract Wallet is OwnableUpgradeSafe {

    event ReceiveEther(address indexed _sender, uint256 _value);
    event Pay(address indexed _sender, uint256 _value);
    /* solhint-disable */
    receive() external payable {
        emit ReceiveEther(msg.sender, msg.value);
    }

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

    function pay(address payable _beneficiary) public onlyOwner {
        uint256 amount = address(this).balance;
        _beneficiary.transfer(amount);
        emit Pay(_beneficiary, amount);
    }

}
