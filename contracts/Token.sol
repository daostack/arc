pragma solidity ^0.4.4;
/*
You should inherit from StandardToken or, for a token like you would want to
deploy in something like Mist, see HumanStandardToken.sol.
(This implements ONLY the standard functions and NOTHING else.
If you deploy this, you won't have anything useful.)

Implements ERC 20 Token standard: https://github.com/ethereum/EIPs/issues/20
.*/

import "./zeppelin-solidity/token/BasicToken.sol";

// TODO: make the following statement work:
// contract Token is ERC20TokenInterface {
contract Token is BasicToken { 

    uint256 public totalSupply;
   
    uint public decimals = 18;
    uint public INITIAL_SUPPLY = 10000;
      
    function Token() {
        totalSupply = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
    }

}
