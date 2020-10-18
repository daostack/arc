pragma solidity ^0.6.12;
// SPDX-License-Identifier: GPL-3.0
pragma experimental ABIEncoderV2;


import "../registry/App.sol";
import "../registry/ImplementationDirectory.sol";
import "@daostack/upgrades/contracts/upgradeability/AdminUpgradeabilityProxy.sol";
import "@daostack/upgrades/contracts/upgradeability/UpgradeabilityProxy.sol";
import "../libs/BytesLib.sol";
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

    function initialize(address _appContractAddress) external initializer {
        app = App(_appContractAddress);
    }

    /**
     * @dev Create a new organization
     * @param _encodedForgeOrgParams encoded ForgeOrgParams
     *     orgName - The name of the new organization
     *     tokenInitData - the DAOToken init data (tokenName,tokenSymbol,cap)
     *     founders - An array with the addresses of the founders of the organization
     *     foundersTokenAmount -  An array of amount of tokens that the founders
     *                            receive in the new organization
     *     foundersReputationAmount - An array of amount of reputation that the
     *                        founders receive in the new organization
     *     version - the arc version to forgeOrg from.
     * @param _encodedSetSchemesParams encoded SetSchemesParams -
     *        if there is a need to add more than 100 founders:
     *          encodedSetSchemesParams should be zero and then do :
     *         forgeOrg,addFounders,setSchemes. this will result in 3 transactions.
     * @return The address of the avatar of the controller
     */
    function forgeOrg (
        bytes calldata _encodedForgeOrgParams,
        bytes calldata _encodedSetSchemesParams)
        external
        returns(address) {
            (
            string memory orgName,
            bytes memory tokenInitData,
            address[] memory founders,
            uint256[] memory foundersTokenAmount,
            uint256[] memory foundersReputationAmount,
            uint64[3] memory version) =
            /* solhint-disable */
            abi.decode(
              _encodedForgeOrgParams,
              (string, bytes, address[], uint256[], uint256[], uint64[3])
            );
            /* solhint-enable */
            uint64[3] memory packageVersion = getPackageVersion(version);
            Avatar avatar =_forgeOrg(
                            orgName,
                            tokenInitData,
                            founders,
                            foundersTokenAmount,
                            foundersReputationAmount,
                            packageVersion);
            if (_encodedSetSchemesParams.length > 0) {

                _setSchemes(
                    address(avatar),
                    _encodedSetSchemesParams,
                    packageVersion);
            } else {
                locks[address(avatar)].sender = msg.sender;
                locks[address(avatar)].packageVersion = packageVersion;
            }
            return address(avatar);
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
            require(_founders[i] != address(0), "founder address cannot be 0");
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
     * @param _encodedSetSchemesParams encoded SetSchemesParams -
     */
    function setSchemes (
        Avatar _avatar,
        bytes calldata _encodedSetSchemesParams
        )
        external {
            // this action can only be executed by the account that holds the lock
            // for this controller
            require(locks[address(_avatar)].sender == msg.sender, "sender is not holding the lock");
            _setSchemes(
                address(_avatar),
                _encodedSetSchemesParams,
                locks[address(_avatar)].packageVersion);
            // Remove lock:
            delete locks[address(_avatar)];
        }

    /**
   * @dev createNonUpgradableInstance creates a new proxy for the given contract and forwards a function call to it.
   * This is useful to initialize the proxied contract.
   * @param _packageVersion of the instance.
   * @param _contractName Name of the contract.
   * @param _data Data to send as msg.data to the corresponding implementation to initialize the proxied contract.
   * It should include the signature and the parameters of the function to be called, as described in
   * https://solidity.readthedocs.io/en/v0.4.24/abi-spec.html#function-selector-and-argument-encoding.
   * This parameter is optional, if no data is given the initialization call to proxied contract will be skipped.
   * @return Address of the new proxy.
   */
    function createNonUpgradableInstance(uint64[3] memory _packageVersion,
                                        string memory _contractName,
                                        bytes memory _data)
    public
    payable
    returns (UpgradeabilityProxy) {
        uint64[3] memory version = getPackageVersion(_packageVersion);
        address implementation = getImplementation(version, _contractName);
        /* solhint-disable */
        UpgradeabilityProxy proxy = (new UpgradeabilityProxy){value:msg.value}(implementation, _data);
        /* solhint-enable */
        emit ProxyCreated(address(proxy), implementation, _contractName, version);
        return proxy;
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
        /* solhint-disable */
        AdminUpgradeabilityProxy proxy = (new AdminUpgradeabilityProxy){value:msg.value}(implementation, _admin, _data);
        /* solhint-enable */
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
        (Package package, ) = app.getPackage(PACKAGE_NAME);
        ImplementationProvider provider = ImplementationProvider(package.getContract(_version));
        return provider.getImplementation(_contractName);
    }

    function getPackageVersion(uint64[3] memory _version) public view returns(uint64[3] memory version) {
        (Package package, uint64[3] memory latestVersion) = app.getPackage(PACKAGE_NAME);
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
     * @param _encodedSetSchemesParams _setSchemes parameters
     * @param _packageVersion package version
     */
    function _setSchemes (
        address payable _avatar,
        bytes memory _encodedSetSchemesParams,
        uint64[3] memory _packageVersion
    )
        private
    {
        (
        bytes32[] memory schemesNames,
        bytes memory schemesData,
        uint256[] memory schemesInitilizeDataLens,
        bytes4[] memory permissions,
        string memory metaData
        ) =
        /* solhint-disable */
        abi.decode(
          _encodedSetSchemesParams,
          (bytes32[], bytes, uint256[], bytes4[], string)
        );
        /* solhint-enable */
         // register initial schemes:
        Controller controller = Controller(Avatar(_avatar).owner());
        uint256 startIndex =  0;
        for (uint256 i = 0; i < schemesNames.length; i++) {
            bytes memory schemeEncodedData = (schemesData.slice(startIndex, schemesInitilizeDataLens[i]));
            if (schemeEncodedData.length >= 4) {
              //add avatar to encoded data and encode the call to initilize
              // functionSignature + encodedAvatar+ encodedRestOfData
                schemeEncodedData = schemeEncodedData.slice(0, 4);
                schemeEncodedData = schemeEncodedData.concat(abi.encode(_avatar));
                schemeEncodedData =
                schemeEncodedData
                .concat((schemesData.slice(startIndex, schemesInitilizeDataLens[i]))
                .slice(36, schemesInitilizeDataLens[i]-36));
            }
            address scheme = address(createInstance(_packageVersion,
                                schemesNames[i].toStr(),
                                _avatar,
                                schemeEncodedData));
            emit SchemeInstance(scheme, schemesNames[i].toStr());
            controller.registerScheme(scheme, permissions[i]);
            startIndex = startIndex.add(schemesInitilizeDataLens[i]);
        }
        controller.metaData(metaData);
         // Unregister self:
        controller.unregisterSelf();
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
        uint256[] memory _foundersReputationAmount,
        uint64[3] memory _packageVersion
    )
    private
    returns(Avatar) {
         // Create Token, Reputation and Avatar:
        require(_founders.length == _foundersTokenAmount.length,
        "_founderlength != _foundersTokenAmount.length");
        require(_founders.length == _foundersReputationAmount.length,
        "_founderlength != _foundersReputationAmount.length");
        UpgradeabilityProxy nativeToken =
        createNonUpgradableInstance(_packageVersion, "DAOToken", _tokenInitData);
        AdminUpgradeabilityProxy nativeReputation =
        createInstance(_packageVersion, "Reputation", address(this),
        abi.encodeWithSignature("initialize(address)", address(this)));

        AdminUpgradeabilityProxy avatar = createInstance(_packageVersion, "Avatar", address(this),
        abi.encodeWithSignature(
            "initialize(string,address,address,address)",
            _orgName,
            address(nativeToken),
            address(nativeReputation),
            address(this)));
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
        _packageVersion,
        "Controller",
        address(avatar),
        abi.encodeWithSignature("initialize(address,address)", address(avatar), address(this)))));
         // Transfer ownership:
        Avatar(address(avatar)).transferOwnership(address(controller));
        DAOToken(address(nativeToken)).transferOwnership(address(controller));
        Reputation(address(nativeReputation)).transferOwnership(address(controller));

        emit NewOrg (address(avatar), address(controller), address(nativeReputation), address(nativeToken));
        return (Avatar(address(avatar)));
    }

}
