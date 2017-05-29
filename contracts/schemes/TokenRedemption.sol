pragma solidity ^0.4.11;
import "../controller/Controller.sol";


contract TokenRedemption {
    Controller controller;

    function TokenRedemption( Controller _controller ) {
        controller = _controller;
    }

    function redeem( uint tokens ) returns(bool) {
        controller.nativeToken().transferFrom(msg.sender,controller, tokens);
        controller.mintTokens(int(tokens) * -1, controller);

        return controller.sendEther(tokens, msg.sender);
    }
}
