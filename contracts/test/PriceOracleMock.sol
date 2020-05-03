pragma solidity 0.5.17;

import "../schemes/PriceOracleInterface.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract PriceOracleMock is PriceOracleInterface, Ownable {

    struct Price {
        uint256 numerator;
        uint256 denominator;
    }

    // user => amount
    mapping (address => Price) public tokenPrices;

    function setTokenPrice(address token, uint256 numerator, uint256 denominator) public onlyOwner {
        tokenPrices[token] = Price(numerator, denominator);
    }
    
    function getPrice(address token) public view returns (uint, uint) {
        Price memory price = tokenPrices[token];
        return (price.numerator, price.denominator);
    }
}
