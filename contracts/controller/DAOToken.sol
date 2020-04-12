pragma solidity ^0.5.17;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20Burnable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";


/**
 * @title DAOToken, base on zeppelin contract.
 * @dev ERC20 compatible token. It is a mintable, burnable token.
 */
contract DAOToken is Initializable, Ownable, ERC20, ERC20Burnable {

    string public name;
    string public symbol;
    // solhint-disable-next-line const-name-snakecase
    uint8 public constant decimals = 18;
    uint256 public cap;

    /**
    * @dev initialize
    * @param _name - token name
    * @param _symbol - token symbol
    * @param _cap - token cap - 0 value means no cap
    */
    function initialize(string calldata _name, string calldata _symbol, uint256 _cap, address _owner)
    external
    initializer {
        name = _name;
        symbol = _symbol;
        cap = _cap;
        Ownable.initialize(_owner);
    }

    /**
     * @dev Function to mint tokens
     * @param _to The address that will receive the minted tokens.
     * @param _amount The amount of tokens to mint.
     */
    function mint(address _to, uint256 _amount) public onlyOwner returns (bool) {
        if (cap > 0) {
            require(totalSupply().add(_amount) <= cap, "override cap");
        }
        _mint(_to, _amount);
        return true;
    }
}
