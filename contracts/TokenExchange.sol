import "./Controller.sol";

contract TokenSale {
    Controller controller;
    function TokenSale( Controller _controller ) {
        controller = _controller;
    }
    
    function() payable {
        if( ! controller.mintToken((int)msg.value, msg.sender) ) throw;
        if( ! controller.send(msg.value) ) throw;
        
        // TODO event
    }
}


contract TokenRedemption {
    Controller controller;
    function TokenRedemption( Controller _controller ) {
        controller = _controller;
    }
    
    function redeem( uint tokens ) returns(bool) {
        if( ! controller.nativeToken.transferFrom(msg.sender,controller, tokens) ) throw;
        if( ! controller.mintTokens((int)tokens * -1, controller) ) throw;
        
        return controller.sendEther(tokens, msg.sender);
    }
}