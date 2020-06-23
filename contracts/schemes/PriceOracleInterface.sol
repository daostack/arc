pragma solidity ^0.6.10;
// SPDX-License-Identifier: GPL-3.0

interface PriceOracleInterface {

    function getPrice(address token) external view returns (uint, uint);

}
