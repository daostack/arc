pragma solidity ^0.4.7;
import "./controller/Controller.sol";

contract TokenRedemption {
    Controller controller;
    function TokenRedemption( Controller _controller ) {
        controller = _controller;
    }
    
    function redeem( uint tokens ) returns(bool) {
        if( ! controller.nativeToken().transferFrom(msg.sender,controller, tokens) ) throw;
        if( ! controller.mintTokens(int(tokens) * -1, controller) ) throw;
        
        return controller.sendEther(tokens, msg.sender);
    }
}
