pragma solidity ^0.5.16;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/upgrades/contracts/application/App.sol";
import "@openzeppelin/upgrades/contracts/application/ImplementationDirectory.sol";
import "@openzeppelin/upgrades/contracts/upgradeability/ProxyAdmin.sol";
import "@openzeppelin/upgrades/contracts/upgradeability/AdminUpgradeabilityProxy.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";
import "../controller/Controller.sol";
import "../libs/Bytes32ToStr.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";


contract DAOFactory is Initializable {
    using BytesLib for bytes;
    using SafeMath for uint256;
    using Bytes32ToStr for bytes32;

    event NewOrg (
        address indexed _avatar,
        address indexed _controller,
        address indexed _reputation,
        address _daotoken
    );

    event InitialSchemesSet (address indexed _avatar);
    event SchemeInstance(address indexed _scheme, string _name);
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
     * @return The address of the avatar of the controller
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
            packageVersion = getPackageVersion(_version);
            return _forgeOrg(_orgName, _tokenInitData, _founders, _foundersTokenAmount, _foundersReputationAmount);
        }

  /**
    * @dev addFounders add founders to the organization.
    *      this function can be called only after forgeOrg and before setSchemes
    * @param _avatar the organization avatar
    * @param _founders An array with the addresses of the founders of the organization
    * @param _foundersTokenAmount An array of amount of tokens that the founders
    *  receive in the new organization
    * @param _foundersReputationAmount An array of amount of reputation that the
    *   founders receive in the new organization
    * @return bool true or false
    */
    function addFounders (
        Avatar _avatar,
        address[] calldata _founders,
        uint[] calldata _foundersTokenAmount,
        uint[] calldata _foundersReputationAmount
    )
    external
    returns(bool)
    {
        require(_founders.length == _foundersTokenAmount.length,
        "_founderlength != _foundersTokenAmount.length");
        require(_founders.length == _foundersReputationAmount.length,
        "_founderlength != _foundersReputationAmount.length");
        require(_founders.length > 0, "no founders");
        require(locks[address(_avatar)].sender == msg.sender, "sender is not holding the lock");
          // Mint token and reputation for founders:
        for (uint256 i = 0; i < _founders.length; i++) {
            require(_founders[i] != address(0));
            if (_foundersTokenAmount[i] > 0) {
                Controller(
                _avatar.owner()).mintTokens(_foundersTokenAmount[i], _founders[i]);
            }
            if (_foundersReputationAmount[i] > 0) {
                Controller(
                _avatar.owner()).mintReputation(_foundersReputationAmount[i], _founders[i]);
            }
        }
        return true;
    }

    /**
     * @dev Set initial schemes for the organization.
     * @param _avatar organization avatar (returns from forgeOrg)
     * @param _schemesNames the schemes name to register for the organization
     * @param _schemesData the schemes initilization data
     * @param _schemesInitilizeDataLens the schemes initilization data lens (at _schemesData)
     * @param _permissions the schemes permissions.
     * @param _metaData dao meta data hash
     */
    function setSchemes (
        Avatar _avatar,
        bytes32[] calldata _schemesNames,
        bytes calldata _schemesData,
        uint256[] calldata _schemesInitilizeDataLens,
        bytes4[] calldata _permissions,
        string calldata _metaData
        )
        external {
            _setSchemes(
                address(_avatar),
                _schemesNames,
                _schemesData,
                _schemesInitilizeDataLens,
                _permissions,
                _metaData);
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
        uint64[3] memory version = getPackageVersion(_packageVersion);
        address implementation = getImplementation(version, _contractName);
        AdminUpgradeabilityProxy proxy = (new AdminUpgradeabilityProxy).value(msg.value)(implementation, _admin, _data);
        emit ProxyCreated(address(proxy), implementation, _contractName, version);
        return proxy;
    }

    /**
   * @dev Helper function to get the implementation contract by a contract name.
   * @param _version of the instance.
   * @param _contractName Name of the contract.
   * @return Address of the new implementation contract.
   */
    function getImplementation(uint64[3] memory _version, string memory _contractName)
    public
    view
    returns (address) {
        Package package;
        (package, ) = app.getPackage(PACKAGE_NAME);
        ImplementationProvider provider = ImplementationProvider(package.getContract(_version));
        return provider.getImplementation(_contractName);
    }

    function getPackageVersion(uint64[3] memory _version) public view returns(uint64[3] memory version) {
        Package package;
        uint64[3] memory latestVersion;
        (package, latestVersion) = app.getPackage(PACKAGE_NAME);
        if (package.getContract(_version) == address(0)) {
            require(package.getContract(latestVersion) != address(0), "ImplementationProvider does not exist");
            version = latestVersion;
        } else {
            version = _version;
        }
    }

    /**
     * @dev Set initial schemes for the organization.
     * @param _avatar organization avatar (returns from forgeOrg)
     * @param _schemesNames the schemes name to register for the organization
     * @param _schemesData the schemes initilization data
     * @param _schemesInitilizeDataLens the schemes initilization data lens (at _schemesData)
     * @param _permissions the schemes permissions.
     * @param _metaData dao meta data hash
     */
    function _setSchemes (
        address payable _avatar,
        bytes32[] memory _schemesNames,
        bytes memory _schemesData,
        uint256[] memory _schemesInitilizeDataLens,
        bytes4[] memory _permissions,
        string memory _metaData
    )
        private
    {
       // this action can only be executed by the account that holds the lock
       // for this controller
        require(locks[_avatar].sender == msg.sender, "sender is not holding the lock");
         // register initial schemes:
        Controller controller = Controller(Avatar(_avatar).owner());
        uint256 startIndex =  0;
        for (uint256 i = 0; i < _schemesNames.length; i++) {
            address scheme = address(createInstance(locks[_avatar].packageVersion,
                                _schemesNames[i].toStr(),
                                _avatar,
                                _schemesData.slice(startIndex, _schemesInitilizeDataLens[i])));
            emit SchemeInstance(scheme, _schemesNames[i].toStr());
            controller.registerScheme(scheme, _permissions[i]);
            startIndex = startIndex.add(_schemesInitilizeDataLens[i]);
        }
        controller.metaData(_metaData);
         // Unregister self:
        controller.unregisterSelf();
         // Remove lock:
        delete locks[_avatar];
        emit InitialSchemesSet(_avatar);
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
     * @return The address of the avatar of the controller
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
         // Create Token, Reputation and Avatar:
        require(_founders.length == _foundersTokenAmount.length,
        "_founderlength != _foundersTokenAmount.length");
        require(_founders.length == _foundersReputationAmount.length,
        "_founderlength != _foundersReputationAmount.length");
        AdminUpgradeabilityProxy nativeToken =
        createInstance(packageVersion, "DAOToken", address(this), _tokenInitData);
        AdminUpgradeabilityProxy nativeReputation =
        createInstance(packageVersion, "Reputation", address(this),
        abi.encodeWithSignature("initialize(address)", address(this)));

        AdminUpgradeabilityProxy avatar = createInstance(packageVersion, "Avatar", address(this),
        abi.encodeWithSignature(
            "initialize(string,address,address,address)",
            _orgName,
            address(nativeToken),
            address(nativeReputation),
            address(this)));
        nativeToken.changeAdmin(address(avatar));
        nativeReputation.changeAdmin(address(avatar));
        avatar.changeAdmin(address(avatar));
         // Mint token and reputation for founders:
        for (uint256 i = 0; i < _founders.length; i++) {
            require(_founders[i] != address(0), "founder address cannot be zero");
            if (_foundersTokenAmount[i] > 0) {
                DAOToken(address(nativeToken)).mint(_founders[i], _foundersTokenAmount[i]);
            }
            if (_foundersReputationAmount[i] > 0) {
                Reputation(address(nativeReputation)).mint(_founders[i], _foundersReputationAmount[i]);
            }
        }
         // Create Controller:
        Controller controller =
        Controller(address(createInstance(
        packageVersion,
        "Controller",
        address(avatar),
        abi.encodeWithSignature("initialize(address,address)", address(avatar), address(this)))));
         // Transfer ownership:
        Avatar(address(avatar)).transferOwnership(address(controller));
        DAOToken(address(nativeToken)).transferOwnership(address(controller));
        Reputation(address(nativeReputation)).transferOwnership(address(controller));

        locks[address(avatar)].sender = msg.sender;
        locks[address(avatar)].packageVersion = packageVersion;

        emit NewOrg (address(avatar), address(controller), address(nativeReputation), address(nativeToken));
        return (address(avatar));
    }

}
