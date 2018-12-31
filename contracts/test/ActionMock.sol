pragma solidity ^0.5.2;

import "../controller/Avatar.sol";


contract ActionMock {

    event WithoutReturnValue(address _addr);

    uint public activationTime;

    function test(uint256 _a, address _b, bytes32 _c) public view returns(uint256) {
        require(_a == 7);
        require(_b == address(this));
        require(_c == 0x1234000000000000000000000000000000000000000000000000000000000000);
        return _a*2;
    }

    function test2(address _addr) public view returns(bool) {
        require(msg.sender == _addr, "the caller must be equal to _addr");
        return true;
    }

    function withoutReturnValue(address _addr) public {
        require(msg.sender == _addr, "the caller must be equal to _addr");
        emit WithoutReturnValue(_addr);
    }

    function setActivationTime(uint _activationTime) public {
        activationTime = _activationTime;
    }

    function test3() public view {
      // solhint-disable-next-line not-rely-on-time
        require(now > activationTime, "now should be greater than the activation time");
    }

}
