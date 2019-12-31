pragma solidity 0.5.15;

import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";


/**
 * @title ActorsRegistry
 */
contract ActorsRegistry is Ownable {

    mapping(address=>bool) public actorsRegistry;

    event RegisterActor(address indexed _actor);
    event UnRegisterActor(address indexed _actor);

    function register(address _actor) public onlyOwner {
        actorsRegistry[_actor] = true;
        emit RegisterActor(_actor);
    }

    function unRegister(address _actor) public onlyOwner {
        actorsRegistry[_actor] = false;
        emit UnRegisterActor(_actor);
    }
}


/**
 * @title AssetsConstraintRegistery
 */
contract AssetsConstraintRegistery is Ownable {

    struct Asset {
        address asset;
        // A mapping from actors to its constraint
        mapping(address=>address) actorsConstraint;
    }

    mapping(string=>Asset) public assetsConstraintRegistery;


    event ConstraintAdded(string _assetName, address indexed _actor, address indexed _constraint);
    event ConstraintRemoved(string  _assetName, address indexed _actor);

    function addAssetConstraint(string memory _assetName,
                                address _asset,
                                address _actor,
                                address _constraint)
    public
    onlyOwner
    {
        assetsConstraintRegistery[_assetName].actorsConstraint[_actor] = _constraint;
        assetsConstraintRegistery[_assetName].asset = _asset;
        emit ConstraintAdded(_assetName, _actor, _constraint);
    }

    function removeAssetConstraint(string memory _assetName, address _actor) public onlyOwner {
        assetsConstraintRegistery[_assetName].actorsConstraint[_actor] = address(0);
        emit ConstraintRemoved(_assetName, _actor);
    }

    function isOkToCall(string memory _assetName,
                        address _actor,
                        bytes memory _data,
                        uint256 _value) public returns(bool okToCall) {
        if (assetsConstraintRegistery[_assetName].actorsConstraint[_actor] == address(0)) {
           //todo: maybe default to false
            okToCall = false;
        } else {
        // solhint-disable-next-line avoid-call-value
            (okToCall,) = assetsConstraintRegistery[_assetName].actorsConstraint[_actor].call.value(_value)(_data);
        }
    }

    function getAssetAddress(string memory _assetName) public returns(address) {
        return assetsConstraintRegistery[_assetName].asset;
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
                        AssetsConstraintRegistery _assetsConstraintRegistery,
                        address _initialActor)
    external
    initializer {
        orgName = _orgName;
        actorsRegistry = _actorsRegistry;
        assetsConstraintRegistery = _assetsConstraintRegistery;
        actorsRegistry.register(_initialActor);
    }

    /**
    * @dev perform a generic call to an arbitrary contract
    * @param _assetName asset name to call
    * @param _data ABI-encoded contract call to call `_contract` address.
    * @param _value value (ETH) to transfer with the transaction
    * @return bool    success or fail
    *         bytes - the return bytes of the called contract's function.
    */
    function genericCall(string calldata _assetName, bytes calldata _data, uint256 _value)
    external
    returns(bool success, bytes memory returnValue) {
        require(actorsRegistry.actorsRegistry(msg.sender), "caller is not a registered actor");
        require(assetsConstraintRegistery.isOkToCall(_assetName, msg.sender, _data, _value),
        "there is a constraint on this call");
        address assetAddress = assetsConstraintRegistery.getAssetAddress(_assetName);
      // solhint-disable-next-line avoid-call-value
        (success, returnValue) = assetAddress.call.value(_value)(_data);
        emit GenericCall(assetAddress, _data, _value, success);
    }
}
