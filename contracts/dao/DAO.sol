pragma solidity 0.5.15;

import "@daostack/infra-experimental/contracts/Reputation.sol";
import "./DAOToken.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "../libs/SafeERC20.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";


/**
 * @title An Avatar holds tokens, reputation and ether for a controller
 */
contract DAO is Initializable, Ownable {
    using SafeERC20 for address;

    string public orgName;
    //
    mapping(address=>bool) public actorsRegistery;
    //a mapping from asset to its constraint contract
    mapping(address=>address) public assetsConstraint;


    event GenericCall(address indexed _contract, bytes _data, uint _value, bool _success);

    /**
    * @dev initialize takes organization name, native token and reputation system
    and creates an avatar for a controller
    */
    function initialize(string calldata _orgName)
    external
    initializer {
        orgName = _orgName;
    }

    // Modifiers:
    modifier onlyRegisteredActors() {
        require(actorsRegistery[msg.sender]);
        _;
    }

    modifier onlyDAO() {
        require(msg.sender == address(this));
        _;
    }

    /**
    * @dev perform a generic call to an arbitrary contract
    * @param _contract  the contract's address to call
    * @param _data ABI-encoded contract call to call `_contract` address.
    * @param _value value (ETH) to transfer with the transaction
    * @return bool    success or fail
    *         bytes - the return bytes of the called contract's function.
    */
    function genericCall(address _contract, bytes calldata _data, uint256 _value)
    external
    onlyRegisteredActors
    returns(bool success, bytes memory returnValue) {
      // solhint-disable-next-line avoid-call-value
        (success, returnValue) = _contract.call.value(_value)(_data);
        emit GenericCall(_contract, _data, _value, success);
    }

    /**
    * @dev registerActor register an actor to the dao
    * @param _actor the actor address
    */
    function registerActor(address _actor)
    external
    onlyRegisteredActors
    returns(bool success, bytes memory returnValue) {
      // solhint-disable-next-line avoid-call-value
        (success, returnValue) = _contract.call.value(_value)(_data);
        emit GenericCall(_contract, _data, _value, success);
    }

}
