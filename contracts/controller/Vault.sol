pragma solidity ^0.5.17;

import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";


//Proxy contracts cannot recive eth via fallback function.
//For now , we will use this vault to overcome that
contract Vault is Ownable {
    event ReceiveEther(address indexed _sender, uint256 _value);
    event SendEther(address indexed _to, uint256 _value);

    /**
    * @dev enables this contract to receive ethers
    */
    function() external payable {
        emit ReceiveEther(msg.sender, msg.value);
    }

    function sendEther(uint256 _amountInWei, address payable _to) external onlyOwner returns(bool) {
        // solhint-disable-next-line avoid-call-value
        (bool success, ) = _to.call.value(_amountInWei)("");
        require(success, "sendEther failed.");
        emit SendEther(_to, _amountInWei);
    }
}
