pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";


/**
 * @title Reputation system
 * @dev A DAO has Reputation System which allows peers to rate other peers in order to build trust .
 * A reputation is use to assign influence measure to a DAO'S peers.
 * Reputation is similar to regular tokens but with one crucial difference: It is non-transferable.
 * The Reputation contract maintain a map of address to reputation value.
 * It provides an onlyOwner function to mint ,negative or positive, reputation for a specific address.
 */

contract Reputation is Ownable {

    mapping (address => uint256) public balances;
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
    * @dev return the reputation amount of a given owner
    * @param _owner an address of the owner which we want to get his reputation
    */
    function reputationOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }

    /**
    * @dev adding/reducing reputation of a given address, updating the total supply,
    * and triggering an event of the operation.
    * Max reputation allowed is capped by INT256_MAX = 2**255 - Any value minted over this MAX will cause a revert.
    * Min reputation allowed is 0. - Any value minted below this MIN will be trim to 0.
    * @param _to the address which we gives/takes reputation amount
    * @param _amount the reputation amount to be added/reduced
    * @return bool which represents a successful of the function
    */
    function mint(address _to, int256 _amount) public onlyOwner capTotalSupply returns (bool) {
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
