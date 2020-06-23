pragma solidity ^0.6.10;
// SPDX-License-Identifier: GPL-3.0

import "../schemes/PriceOracleInterface.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";
import "@daostack/upgrades/contracts/Initializable.sol";


contract PriceOracleMock is Initializable, PriceOracleInterface, Ownable {

    struct Price {
        uint256 numerator;
        uint256 denominator;
    }

    // user => amount
    mapping (address => Price) public tokenPrices;

    /**
    * @dev initialize
    * @param _owner contract owner
    */
    function initialize(address _owner)
    public
    initializer {
        Ownable.initialize(_owner);
    }

    function setTokenPrice(address token, uint256 numerator, uint256 denominator) public onlyOwner {
        tokenPrices[token] = Price(numerator, denominator);
    }

    function getPrice(address token) public view returns (uint, uint) {
        Price memory price = tokenPrices[token];
        return (price.numerator, price.denominator);
    }
}
