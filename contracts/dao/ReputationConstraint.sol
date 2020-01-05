pragma solidity ^0.5.15;

import "@daostack/infra-experimental/contracts/Reputation.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";

/**
 * @title ReputationConstraint
 * this is just a referece implemenation.
 */
contract ReputationConstraint is  Initializable {
    using SafeMath for uint256;

    Reputation public reputation;

    /**
    * @dev initialize
    */
    function initialize(Reputation _reputation)
    public
    initializer {
        reputation = _reputation;
    }

      /// @notice mint - check that there is no inflation of more than 10% in a single mint operation
      /// @param _amount The quantity of reputation generated
      /// @return True if the mint operation is allowed
    function mint(address, uint256 _amount) public returns (bool) {
        uint256 curTotalSupply = reputation.totalSupply();
        return (curTotalSupply.add(_amount) < curTotalSupply.mul(110).div(100));
    }

      /// @notice Burns `_amount` reputation from `_owner`
      /// @return True if the reputation are burned correctly
    function burn(address, uint256) public returns (bool) {
        return true;
    }
}
