pragma solidity ^0.6.12;
// SPDX-License-Identifier: GPL-3.0

import "../schemes/PriceOracleInterface.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";



contract PriceOracleMock is Initializable, PriceOracleInterface, OwnableUpgradeSafe {

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
        __Ownable_init_unchained();
        transferOwnership(_owner);
    }

    function setTokenPrice(address token, uint256 numerator, uint256 denominator) public onlyOwner {
        tokenPrices[token] = Price(numerator, denominator);
    }

    function getPrice(address token) public view override returns (uint, uint) {
        Price memory price = tokenPrices[token];
        return (price.numerator, price.denominator);
    }
}
