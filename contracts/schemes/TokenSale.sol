pragma solidity ^0.4.11;
import "../controller/Controller.sol";

contract TokenSale {
    Controller controller;

    function TokenSale( Controller _controller ) {
        controller = _controller;
    }

    function() payable {
        if( ! controller.mintTokens(int(msg.value), msg.sender) ) revert();
        controller.transfer(msg.value);

        // TODO event
    }
}
