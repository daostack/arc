pragma solidity ^0.4.25;

interface PriceOracleInterface {

  function getPrice(address token) external view returns (uint, uint);

}
