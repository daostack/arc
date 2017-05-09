pragma solidity ^0.4.11;
import "../controller/Controller.sol";


contract PayAction is ActionInterface {

    event Pay(address _to, uint _amount);

    function PayAction(){}

    function action( uint _param ) returns(bool){
        WithdrawEtherFromOldController owner = WithdrawEtherFromOldController(address(_param));

        address to = owner.payTo();
        uint amount = owner.amountToPay();
        Pay(to, amount);
        to.transfer(amount);

        return true;
    }

    function kill() {
        selfdestruct(msg.sender);
    }

    event Error( uint x );
    function() payable {
        Error(2);
    }

}


// NOTE! this is a huge security breach. We implement the contract only for illustration
contract WithdrawEtherFromOldController {
    event Withdraw( address _oldController, address _to, uint _amount );

    function WithdrawOldControllerEther(){}

    address public payTo;
    uint    public amountToPay;

    function encodeValue( bytes _param, uint _value, uint _startByte, uint _numBytes ) constant {
        uint tempValue = _value;

        for( uint i = 0 ; i < _numBytes ; i++ ) {
            _param[_startByte + i] = byte(tempValue & 0xFF);
            tempValue = tempValue >> 8;
        }
    }

    function withdraw( Controller _oldController, uint _amount ) returns(bool){
        Withdraw(_oldController,msg.sender,_amount);

        // NOTE! this is a huge security breach. We implement it only for illustration
        /*bytes memory input = new bytes(20 + 32);*/
        //encodeValue(input,uint(msg.sender),0,20);
        //encodeValue(input,_amount,20,32);

        payTo = msg.sender;
        amountToPay = _amount;

        PayAction pay = new PayAction();

        if( ! _oldController.genericAction( pay, uint(this) ) ) revert();
        //if( ! _oldController.sendEther( _amount, msg.sender ) ) throw;

        pay.kill();

        return true;
    }
}
