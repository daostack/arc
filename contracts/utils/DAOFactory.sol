pragma solidity 0.5.15;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/upgrades/contracts/application/App.sol";
import "@openzeppelin/upgrades/contracts/application/ImplementationDirectory.sol";
import "@openzeppelin/upgrades/contracts/upgradeability/ProxyAdmin.sol";
import "@openzeppelin/upgrades/contracts/upgradeability/AdminUpgradeabilityProxy.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";
import "../libs/DAOCallerHelper.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "@daostack/infra-experimental/contracts/Reputation.sol";
import "../dao/DAOToken.sol";


contract DAOFactory is Initializable {
    using BytesLib for bytes;
    using SafeMath for uint256;
    using DAOCallerHelper for DAO;

    event NewOrg (
        address indexed _dao,
        address indexed _reputation,
        address indexed _daotoken
    );

    event InitialActorsSet (address indexed _dao);
    event ActorInstance(address indexed _actor, string _name);
    /**
    * @dev Emitted when a new proxy is created.
    * @param _proxy Address of the created proxy.
    * @param _version of the created proxy.
    */
    event ProxyCreated(address _proxy, address _implementation, string _contractName, uint64[3] _version);

    struct Locks {
        address sender;
        uint64[3] packageVersion;
    }

    mapping(address=>Locks) public locks;
    App public app;
    string public constant PACKAGE_NAME = "DAOstack";
    //this is here due to "stack too deep issue"
    uint64[3] private packageVersion;

    function initialize(address _appContractAddress) external initializer {
        app = App(_appContractAddress);
    }

    /**
     * @dev Create a new organization
     * @param _orgName The name of the new organization
     * @param _tokenInitData the DAOToken init data (tokenName,tokenSymbol,cap)
     * @param _founders An array with the addresses of the founders of the organization
     * @param _foundersTokenAmount An array of amount of tokens that the founders
     *  receive in the new organization
     * @param _foundersReputationAmount An array of amount of reputation that the
     *   founders receive in the new organization
     * @return The address of the dao of the controller
     */
    function forgeOrg (
        string calldata _orgName,
        bytes calldata _tokenInitData,
        address[] calldata _founders,
        uint[] calldata _foundersTokenAmount,
        uint[] calldata _foundersReputationAmount,
        uint64[3] calldata _version)
        external
        returns(address) {
            Package package;
            uint64[3] memory latestVersion;
            (package, latestVersion) = app.getPackage(PACKAGE_NAME);
            if (package.getContract(_version) == address(0)) {
                require(package.getContract(latestVersion) != address(0), "ImplementationProvider does not exist");
                packageVersion = latestVersion;
            } else {
                packageVersion = _version;
            }
            return _forgeOrg(_orgName, _tokenInitData, _founders, _foundersTokenAmount, _foundersReputationAmount);
        }

  /**
    * @dev addFounders add founders to the organization.
    *      this function can be called only after forgeOrg and before setActors
    * @param _dao the organization dao
    * @param _founders An array with the addresses of the founders of the organization
    * @param _foundersTokenAmount An array of amount of tokens that the founders
    *  receive in the new organization
    * @param _foundersReputationAmount An array of amount of reputation that the
    *   founders receive in the new organization
    * @return bool true or false
    */
    function addFounders (
        DAO _dao,
        address[] calldata _founders,
        uint[] calldata _foundersTokenAmount,
        uint[] calldata _foundersReputationAmount
    )
    external
    returns(bool)
    {
        require(_founders.length == _foundersTokenAmount.length);
        require(_founders.length == _foundersReputationAmount.length);
        require(_founders.length > 0);
        require(locks[address(_dao)].sender == msg.sender);
          // Mint token and reputation for founders:
        for (uint256 i = 0; i < _founders.length; i++) {
            require(_founders[i] != address(0));
            if (_foundersTokenAmount[i] > 0) {
                _dao.nativeTokenMint(_founders[i], _foundersTokenAmount[i]);
            }
            if (_foundersReputationAmount[i] > 0) {
                _dao.reputationMint(_founders[i], _foundersTokenAmount[i]);
            }
        }
        return true;
    }

    /**
     * @dev Set initial actors for the organization.
     * @param _dao organization dao (returns from forgeOrg)
     * @param _actorsNames the actors name to register for the organization
     * @param _actorsData the actors initilization data
     * @param _actorsInitilizeDataLens the actors initilization data lens (at _actorsData)
     */
    function setActors (
        DAO _dao,
        bytes32[] calldata _actorsNames,
        bytes calldata _actorsData,
        uint256[] calldata _actorsInitilizeDataLens
        )
        external {
            _setActors(
                address(_dao),
                _actorsNames,
                _actorsData,
                _actorsInitilizeDataLens);
        }

    /**
   * @dev Creates a new proxy for the given contract and forwards a function call to it.
   * This is useful to initialize the proxied contract.
   * @param _packageVersion of the instance.
   * @param _contractName Name of the contract.
   * @param _admin Address of the proxy administrator.
   * @param _data Data to send as msg.data to the corresponding implementation to initialize the proxied contract.
   * It should include the signature and the parameters of the function to be called, as described in
   * https://solidity.readthedocs.io/en/v0.4.24/abi-spec.html#function-selector-and-argument-encoding.
   * This parameter is optional, if no data is given the initialization call to proxied contract will be skipped.
   * @return Address of the new proxy.
   */
    function createInstance(uint64[3] memory _packageVersion,
                            string memory _contractName,
                            address _admin,
                            bytes memory _data)
    public
    payable
    returns (AdminUpgradeabilityProxy) {
        address implementation = getImplementation(_contractName, _packageVersion);
        AdminUpgradeabilityProxy proxy = (new AdminUpgradeabilityProxy).value(msg.value)(implementation, _admin, _data);
        emit ProxyCreated(address(proxy), implementation, _contractName, _packageVersion);
        return proxy;
    }

    function getLatestPackageVersion() public view returns (uint64[3] memory latestVersion) {
        (, latestVersion) = app.getPackage(PACKAGE_NAME);
    }

    function getImplementation(string memory _contractName, uint64[3] memory _packageVersion)
    public
    view
    returns (address) {
        Package package;
        (package, ) = app.getPackage(PACKAGE_NAME);
        ImplementationProvider provider = ImplementationProvider(package.getContract(_packageVersion));
        return provider.getImplementation(_contractName);
    }

    /**
     * @dev Set initial actors for the organization.
     * @param _dao organization dao (returns from forgeOrg)
     * @param _actorsNames the actors name to register for the organization
     * @param _actorsData the actors initilization data
     * @param _actorsInitilizeDataLens the actors initilization data lens (at _actorsData)
     */
    function _setActors (
        address _dao,
        bytes32[] memory _actorsNames,
        bytes memory _actorsData,
        uint256[] memory _actorsInitilizeDataLens
    )
        private
    {
       // this action can only be executed by the account that holds the lock
       // for this dao
        require(locks[_dao].sender == msg.sender);
         // register initial actors:
        uint256 startIndex =  0;
        for (uint256 i = 0; i < _actorsNames.length; i++) {
            address actor = address(createInstance(locks[_dao].packageVersion,
                                bytes32ToStr(_actorsNames[i]),
                                _dao,
                                _actorsData.slice(startIndex, _actorsInitilizeDataLens[i])));
            emit ActorInstance(actor, bytes32ToStr(_actorsNames[i]));
            DAO(_dao).registerActor(actor);
            startIndex = startIndex.add(_actorsInitilizeDataLens[i]);
        }
         // Unregister self:
        DAO(_dao).unRegisterActor(address(this));
         // Remove lock:
        delete locks[_dao];
        emit InitialActorsSet(_dao);
    }

    function bytes32ToStr(bytes32 x) private pure returns (string memory) {
        bytes memory bytesString = new bytes(32);
        uint charCount = 0;
        uint j;
        for (j = 0; j < 32; j++) {
            byte char = byte(bytes32(uint(x) * 2 ** (8 * j)));
            if (char != 0) {
                bytesString[charCount] = char;
                charCount++;
            }
        }
        bytes memory bytesStringTrimmed = new bytes(charCount);
        for (j = 0; j < charCount; j++) {
            bytesStringTrimmed[j] = bytesString[j];
        }
        return string(bytesStringTrimmed);
    }

    /**
     * @dev Create a new organization
     * @param _orgName The name of the new organization
     * @param _tokenInitData the DAOToken init data (tokenName,tokenSymbol,cap)
     * @param _founders An array with the addresses of the founders of the organization
     * @param _foundersTokenAmount An array of amount of tokens that the founders
     *  receive in the new organization
     * @param _foundersReputationAmount An array of amount of reputation that the
     *   founders receive in the new organization
     * @return The address of the dao of the controller
     */
    function _forgeOrg (
        string memory _orgName,
        bytes  memory _tokenInitData,
        address[] memory _founders,
        uint256[] memory _foundersTokenAmount,
        uint256[] memory _foundersReputationAmount
    )
    private
    returns(address) {
         // Create Token, Reputation and DAO:
        require(_founders.length == _foundersTokenAmount.length);
        require(_founders.length == _foundersReputationAmount.length);
        require(_founders.length > 0);
        AdminUpgradeabilityProxy nativeToken =
        createInstance(packageVersion, "DAOToken", address(this), _tokenInitData);
        AdminUpgradeabilityProxy nativeReputation =
        createInstance(packageVersion, "Reputation", address(this),
        abi.encodeWithSignature("initialize(address)", address(this)));

        AdminUpgradeabilityProxy actorsRegistry = createInstance(packageVersion, "ActorsRegistry", address(this),
        abi.encodeWithSignature("initialize(address)", address(this)));

        AdminUpgradeabilityProxy assetsRegistery = createInstance(packageVersion, "AssetsRegistery", address(this),
        abi.encodeWithSignature("initialize(address)", address(this)));

        AdminUpgradeabilityProxy dao = createInstance(packageVersion, "DAO", address(this),
        abi.encodeWithSignature(
            "initialize(string,address,address,address)",
            _orgName,
            address(actorsRegistry),
            address(assetsRegistery),
            address(this)));

         // Mint token and reputation for founders:
        for (uint256 i = 0; i < _founders.length; i++) {
            require(_founders[i] != address(0));
            if (_foundersTokenAmount[i] > 0) {
                DAOToken(address(nativeToken)).mint(_founders[i], _foundersTokenAmount[i]);
            }
            if (_foundersReputationAmount[i] > 0) {
                Reputation(address(nativeReputation)).mint(_founders[i], _foundersReputationAmount[i]);
            }
        }
        AssetsRegistery(address(assetsRegistery)).register("AssetsRegistery", address(assetsRegistery));
        AssetsRegistery(address(assetsRegistery)).register("ActorsRegistry", address(actorsRegistry));
        AssetsRegistery(address(assetsRegistery)).register("NativeToken", address(nativeToken));
        AssetsRegistery(address(assetsRegistery)).register("Reputation", address(nativeReputation));

         // Transfer ownership:
        transferOwnershipAndAdmin([assetsRegistery, actorsRegistry, nativeToken,
                                    nativeReputation], address(dao));
        dao.changeAdmin(address(dao));
        locks[address(dao)].sender = msg.sender;
        locks[address(dao)].packageVersion = packageVersion;

        emit NewOrg (address(dao), address(nativeReputation), address(nativeToken));
        return (address(dao));
    }

    function transferOwnershipAndAdmin(AdminUpgradeabilityProxy[4] memory _assets, address _dao) private {
        for (uint256 i = 0; i < 4; i++) {
            _assets[i].changeAdmin(_dao);
            Ownable(address(_assets[i])).transferOwnership(_dao);
        }
    }

}
