pragma solidity 0.5.15;
import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";


contract Wallet is Ownable {

    event ReceiveEther(address indexed _sender, uint256 _value);
    event Pay(address indexed _sender, uint256 _value);

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

    function pay(address payable _beneficiary) public onlyOwner {
        uint256 amount = address(this).balance;
        _beneficiary.transfer(amount);
        emit Pay(_beneficiary, amount);
    }

}
