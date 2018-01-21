pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";


/**
 * @title Simple static reputation storage
 * @dev The reputation is represented by the owner of the contract
 * which is usually the controller's address
 */

contract Reputation is Ownable {

    mapping (address => uint256) balances;
    uint256 public totalSupply;
    uint public decimals = 18;

    // Event indicating minting of reputation to an address.
    event Mint(address indexed to, int256 amount);

    /**
    * @dev enforce a cap to avoid casting problems
    */
    modifier capTotalSupply() {
        _;
        require(int(totalSupply) >= 0);
    }

    /**
    * @dev the constructor initiate a reputation system with no supply at all
    */
    function Reputation() public {
        balances[msg.sender] = 0;
        totalSupply = 0;
    }

    /**
    * @dev return the reputation amount of a given owner
    * @param _owner an address of the owner which we want to get his reputation
    */
    function reputationOf(address _owner) public constant returns (uint256 balance) {
        return balances[_owner];
    }

    /**
    * @dev adding/reducing reputation of a given address, updating the total supply,
    * and triggering an event of the operation.
    * @param _to the address which we gives/takes reputation amount
    * @param _amount the reputation amount to be added/reduced
    * @return bool which represents a successful of the function
    */
    function mint(address _to, int256 _amount) public onlyOwner capTotalSupply returns (bool) {
        // create new tokens and add them to the given account
        int amountMinted = _amount;

        if (int(balances[_to]) + _amount >= 0 ) {
            balances[_to] = uint(int(balances[_to]) + _amount);
            totalSupply = uint(int(totalSupply) + _amount);
        } else {
            amountMinted = (-1)*int(balances[_to]);
            totalSupply -= balances[_to];
            balances[_to] = 0;
        }

        Mint(_to, amountMinted);
        return true;
    }
}
