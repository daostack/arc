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
 * @title AssetsRegistery
 */
contract AssetsRegistery is Ownable {

    struct Asset {
        address asset;
        // A mapping from actors to its constraint
        mapping(address=>address) actorsConstraint;
    }

    mapping(string=>Asset) public assetsRegistery;


    event ConstraintAdded(string _assetName, address indexed _actor, address indexed _constraint);
    event ConstraintRemoved(string  _assetName, address indexed _actor);
    event RegisterAsset(string  _assetName, address indexed _actor);
    event UnRegisterAsset(string  _assetName);

    function register(string memory _assetName, address _asset) public onlyOwner
    {
        assetsRegistery[_assetName].asset = _asset;
        emit RegisterAsset(_assetName, _asset);
    }

    function unRegister(string memory _assetName) public onlyOwner
    {
        delete (assetsRegistery[_assetName]);
        emit UnRegisterAsset(_assetName);
    }

    function addConstraint(string memory _assetName,
                                address _actor,
                                address _constraint)
    public
    onlyOwner
    {
        require(assetsRegistery[_assetName].asset != address(0), "asset does not exist");
        assetsRegistery[_assetName].actorsConstraint[_actor] = _constraint;
        emit ConstraintAdded(_assetName, _actor, _constraint);
    }

    function removeConstraint(string memory _assetName, address _actor) public onlyOwner {
        assetsRegistery[_assetName].actorsConstraint[_actor] = address(0);
        emit ConstraintRemoved(_assetName, _actor);
    }

    function isOkToCall(string memory _assetName,
                        address _actor,
                        bytes memory _data,
                        uint256 _value) public returns(bool okToCall) {
        if (assetsRegistery[_assetName].actorsConstraint[_actor] == address(0)) {
           //todo: maybe default to false
            okToCall = true;
        } else {
        // solhint-disable-next-line avoid-call-value
            (okToCall,) = assetsRegistery[_assetName].actorsConstraint[_actor].call.value(_value)(_data);
        }
    }

    function getAssetAddress(string memory _assetName) public view returns(address) {
        return assetsRegistery[_assetName].asset;
    }
}


/**
 * @title A DAO
 */
contract DAO is Initializable {

    string public orgName;
    ActorsRegistry public actorsRegistry;
    AssetsRegistery public assetsRegistery;


    event GenericCall(address indexed _contract, bytes _data, uint _value, bool _success);

    /**
    * @dev initialize takes organization name, native token and reputation system
    and creates an avatar for a controller
    */
    function initialize(string calldata _orgName,
                        ActorsRegistry _actorsRegistry,
                        AssetsRegistery _assetsRegistery,
                        address _initialActor)
    external
    initializer {
        orgName = _orgName;
        actorsRegistry = _actorsRegistry;
        assetsRegistery = _assetsRegistery;
        actorsRegistry.register(_initialActor);
        assetsRegistery.register("ActorsRegistry", address(actorsRegistry));
        assetsRegistery.register("AssetsRegistery", address(assetsRegistery));
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
        require(assetsRegistery.isOkToCall(_assetName, msg.sender, _data, _value),
        "there is a constraint on this call");
        address assetAddress = assetsRegistery.getAssetAddress(_assetName);
      // solhint-disable-next-line avoid-call-value
        (success, returnValue) = assetAddress.call.value(_value)(_data);
        emit GenericCall(assetAddress, _data, _value, success);
    }
}
