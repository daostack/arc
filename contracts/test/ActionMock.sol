pragma solidity ^0.4.24;

import "../controller/Avatar.sol";


contract ActionMock {

    function test(uint _a,address _b,bytes32 _c) public view returns(uint) {
        require(_a == 7);
        require(_b == address(this));
        require(_c == 0x1234000000000000000000000000000000000000000000000000000000000000);
        return _a*2;
    }

}
