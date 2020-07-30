pragma solidity ^0.6.12;
// SPDX-License-Identifier: GPL-3.0

import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";


//Proxy contracts cannot recive eth via fallback function.
//For now , we will use this vault to overcome that
contract Vault is OwnableUpgradeSafe {
    event ReceiveEther(address indexed _sender, uint256 _value);
    event SendEther(address indexed _to, uint256 _value);

    /**
    * @dev initialize
    * @param _owner vault owner
    */
    function initialize(address _owner)
    external
    initializer {
        __Ownable_init_unchained();
        transferOwnership(_owner);
    }

    /**
    * @dev enables this contract to receive ethers
    */
    /* solhint-disable */
    receive() external payable {
        emit ReceiveEther(msg.sender, msg.value);
    }

    function sendEther(uint256 _amountInWei, address payable _to) external onlyOwner returns(bool) {
        // solhint-disable-next-line avoid-call-value
        (bool success, ) = _to.call{value:_amountInWei}("");
        require(success, "sendEther failed.");
        emit SendEther(_to, _amountInWei);
    }
}
