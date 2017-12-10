pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol";
import "zeppelin-solidity/contracts/token/MintableToken.sol";


/**
 * @title SaftToken
 * @dev Very simple ERC20 Token that can be minted.
 * It is meant to be used in a crowdsale contract.
 */
contract SaftToken is MintableToken {
    string public constant name = "DAOStack Saft Token";
    string public constant symbol = "DST";
    uint8 public constant decimals = 18;
}


/**
 * @title SaftTokenSale
 * @dev The DAOStack SAFT token sale.
 */
contract SaftTokenSale is CappedCrowdsale {

    function SaftTokenSale(uint256 _startTime, uint256 _endTime, uint256 _rate, uint256 _cap, address _wallet)
    public
    CappedCrowdsale(_cap)
    Crowdsale(_startTime, _endTime, _rate, _wallet)
    {

    }

    function createTokenContract() internal returns (MintableToken) {
        return new SaftToken();
    }

}
