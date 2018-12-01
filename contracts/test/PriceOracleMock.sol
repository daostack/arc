pragma solidity ^0.4.25;

import "../schemes/PriceOracleInterface.sol";


contract PriceOracleMock is PriceOracleInterface {

    struct Price {
        uint numerator;
        uint denominator;
    }
    // user => amount
    mapping (address => Price) public tokenPrices;


    function getPrice(address token) public view returns (uint, uint) {
        Price memory price = tokenPrices[token];
        return (price.numerator, price.denominator);
    }

    function setTokenPrice(address token,uint numerator,uint denominator) public {
        tokenPrices[token] = Price(numerator,denominator);
    }
}
