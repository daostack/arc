pragma solidity ^0.4.7;
import "../controller/Controller.sol";

contract TokenSale {
    Controller controller;
    
    function TokenSale( Controller _controller ) {
        controller = _controller;
    }
    
    function() payable {
        if( ! controller.mintTokens(int(msg.value), msg.sender) ) throw;
        if( ! controller.send(msg.value) ) throw;
        
        // TODO event
    }
}