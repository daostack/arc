pragma solidity 0.5.15;
import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";


contract Wallet is Ownable {

    event ReceiveEther(address indexed _sender, uint256 _value);
    event SendEther(address indexed _sender, uint256 _value);

    function() external payable {
        emit ReceiveEther(msg.sender, msg.value);
    }

    /**
    * @dev initialize
    * @param _owner contract owner
    */
    function initialize(address _owner)
    public
    initializer {
        Ownable.initialize(_owner);
    }

    /**
    * @dev initialize
    * @param _amountInWei amount to send in Wei units
    */
    function sendEther(address payable _beneficiary, uint256 _amountInWei) public onlyOwner {
        _beneficiary.transfer(_amountInWei);
        emit SendEther(_beneficiary, _amountInWei);
    }

}
