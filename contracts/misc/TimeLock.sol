pragma solidity ^0.5.17;


contract TimeLock {

    address public owner;
    uint256 public releaseTime;

    constructor(address _owner, uint256 _releaseTime) public {
        owner = _owner;
        releaseTime = _releaseTime;
    }

    function () external payable {
    }

    function withdraw() external {
        require(msg.sender == owner, "only owner can withdraw");
       // solhint-disable-next-line not-rely-on-time
        require(releaseTime < now, "cannot withdraw before releaseTime");
          // solhint-disable-next-line avoid-call-value
        (bool success, ) = owner.call.value(address(this).balance)("");
        require(success, "sendEther failed.");
    }

}
