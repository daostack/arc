pragma solidity ^0.5.16;

interface PriceOracleInterface {

    function getPrice(address token) external view returns (uint, uint);

}
