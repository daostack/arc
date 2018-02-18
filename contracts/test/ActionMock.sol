pragma solidity ^0.4.19;

import "../controller/Avatar.sol";


contract ActionMock is ActionInterface {

    event Action(address _sender,bytes32 _param);

    function action(bytes32[] params) public returns(bool) {
        Action(msg.sender,params[0]);
        require(params[0] != 0x1234000000000000000000000000000000000000000000000000000000000000);
        return true;
    }

    function genericAction(Avatar avatar,bytes32[] params) public returns(bool) {
        return avatar.genericAction(address(this),params);
    }

}
