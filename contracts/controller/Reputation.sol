pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";


/**
 * @title Simple static reputation storage
 * @dev The reputation is represented by the owner of the contract
 * which is usually the controller's address
 */

contract Reputation is Ownable {
    using SafeMath for uint;

    mapping (address => uint256) balances;
    uint256 public totalSupply;
    uint public decimals = 18;

    event Mint(address indexed to, int256 amount);

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
    * and triggering an event of the operation
    * @param _to the address which we gives/takes reputation amount
    * @param _amount the reputation amount to be added/reduced
    * @return bool which represents a successful of the function
    */
    function mint(address _to, int256 _amount) public onlyOwner returns (bool) {
        // create new tokens and add them to the given account
        uint absAmount; // allow to reduce reputation also for non owner
        if ( _amount >= 0 ) {
            absAmount = uint(_amount);
            totalSupply = totalSupply.add(absAmount);
            balances[_to] = balances[_to].add(absAmount);
        } else {
            absAmount = uint((-1)*_amount);
            totalSupply = totalSupply.sub(absAmount);
            balances[_to] = balances[_to].sub(absAmount);
        }
        Mint(_to, _amount);
        return true;
    }

    /**
    * @dev setting reputation amount for a given address, updating the total supply as well
    * @param _to the address which we set it's reputation amount
    * @param _amount the new reputation amount to be setted
    * @return bool which represents a success
    */
    function setReputation(address _to, uint256 _amount) public onlyOwner returns (bool) {
        // set the balance of _to to _amount
        totalSupply = (totalSupply.sub(balances[_to])).add(_amount);
        balances[_to] = _amount;
        return true;
    }
}
