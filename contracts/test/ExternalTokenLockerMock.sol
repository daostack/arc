pragma solidity 0.5.15;

import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";


contract ExternalTokenLockerMock is Ownable {

    // user => amount
    mapping (address => uint256) public lockedTokenBalances;

    /**
    * @dev initialize
    * @param _owner contract owner
    */
    function initialize(address _owner)
    public
    initializer {
        Ownable.initialize(_owner);
    }

    function lock(uint256 _amount, address _beneficiary) public onlyOwner {
        lockedTokenBalances[_beneficiary] = _amount;
    }

    function balanceOf(address _beneficiary) public view returns(uint256) {
        return lockedTokenBalances[_beneficiary];
    }
}
