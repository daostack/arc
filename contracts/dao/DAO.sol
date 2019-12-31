pragma solidity 0.5.15;

import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";


/**
 * @title ActorsRegistry
 */
contract ActorsRegistry is Ownable {

    mapping(address=>bool) public actorsRegistry;

    function registerActor(address _actor) public onlyOwner {
        actorsRegistry[_actor] = true;
    }

    function unregisterActor(address _actor) public onlyOwner {
        actorsRegistry[_actor] = false;
    }
}


/**
 * @title AssetsConstraintRegistery
 */
contract AssetsConstraintRegistery is Ownable {

    //a mapping from asset to actors and its constraint
    mapping(address=>mapping(address=>address)) public assetsConstraintRegistery;

    function addAssetConstraint(address _asset, address _actor, address _constraint) public onlyOwner {
        assetsConstraintRegistery[_asset][_actor] = _constraint;
    }

    function removeAssetConstraint(address _asset, address _actor) public onlyOwner {
        assetsConstraintRegistery[_asset][_actor] = address(0);
    }

    function isOkToCall(address _actor,
                        address _asset,
                        bytes memory _data,
                        uint256 _value) public returns(bool okToCall) {
        if (assetsConstraintRegistery[_asset][_actor] == address(0)) {
           //todo: maybe default to false
            okToCall = true;
        } else {
        // solhint-disable-next-line avoid-call-value
            (okToCall,) = assetsConstraintRegistery[_asset][_actor].call.value(_value)(_data);
        }
    }
}


/**
 * @title A DAO
 */
contract DAO is Initializable {

    string public orgName;
    ActorsRegistry public actorsRegistry;
    AssetsConstraintRegistery public assetsConstraintRegistery;


    event GenericCall(address indexed _contract, bytes _data, uint _value, bool _success);

    /**
    * @dev initialize takes organization name, native token and reputation system
    and creates an avatar for a controller
    */
    function initialize(string calldata _orgName,
                        ActorsRegistry _actorsRegistry,
                        AssetsConstraintRegistery _assetsConstraintRegistery)
    external
    initializer {
        orgName = _orgName;
        actorsRegistry = _actorsRegistry;
        assetsConstraintRegistery = _assetsConstraintRegistery;
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
    returns(bool success, bytes memory returnValue) {
        require(actorsRegistry.actorsRegistry(msg.sender), "caller is not a registered actor");
        require(assetsConstraintRegistery.isOkToCall(msg.sender, _contract, _data, _value),
        "there is a constraint on this call");
      // solhint-disable-next-line avoid-call-value
        (success, returnValue) = _contract.call.value(_value)(_data);
        emit GenericCall(_contract, _data, _value, success);
    }
}
