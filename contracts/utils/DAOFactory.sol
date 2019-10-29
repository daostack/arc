pragma solidity ^0.5.11;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/upgrades/contracts/application/App.sol";
import "@openzeppelin/upgrades/contracts/application/ImplementationDirectory.sol";
import "@openzeppelin/upgrades/contracts/upgradeability/ProxyAdmin.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";
import "../controller/Controller.sol";
import "../utils/DAOTracker.sol";


contract DAOFactory is Initializable {
    using BytesLib for bytes;

    event NewOrg (address _avatar);
    event InitialSchemesSet (address _avatar);

    mapping(address=>address) public locks;
    App public app;
    string public constant PACKAGE_NAME = "DAOstack";
    DAOTracker private daoTracker;

    function initialize(address _appContractAddress, DAOTracker _daoTracker) external initializer {
        require(_daoTracker != DAOTracker(0));
        app = App(_appContractAddress);
        daoTracker = _daoTracker;
    }

    function createInstance(bytes calldata _data, string calldata _contractName) external returns (address proxy) {
        address admin = msg.sender;
        return address(app.create(PACKAGE_NAME, _contractName, admin, _data));
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
        bytes  calldata _tokenInitData,
        address[] calldata _founders,
        uint[] calldata _foundersTokenAmount,
        uint[] calldata _foundersReputationAmount)
        external
        returns(address) {
            return _forgeOrg(_orgName, _tokenInitData, _founders, _foundersTokenAmount, _foundersReputationAmount);
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
                _avatar,
                _schemesNames,
                _schemesData,
                _schemesInitilizeDataLens,
                _permissions,
                _metaData);
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
        Avatar _avatar,
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
        require(locks[address(_avatar)] == msg.sender);
         // register initial schemes:
        Controller controller = Controller(_avatar.owner());
        uint256 startIndex =  0;
        for (uint256 i = 0; i < _schemesNames.length; i++) {
            address scheme = address(app.create(PACKAGE_NAME,
                            string(bytes32ToStr(_schemesNames[i])),
                            msg.sender,
                            _schemesData.slice(startIndex, _schemesInitilizeDataLens[i])));
            startIndex = _schemesInitilizeDataLens[i];
            controller.registerScheme(scheme, _permissions[i]);
        }
        controller.metaData(_metaData);
         // Unregister self:
        controller.unregisterScheme(msg.sender);
         // Remove lock:
        delete locks[address(_avatar)];
        emit InitialSchemesSet(address(_avatar));
    }

    function bytes32ToStr(bytes32 _bytes32) private pure returns (string memory) {

    // string memory str = string(_bytes32);
    // TypeError: Explicit type conversion not allowed from "bytes32" to "string storage pointer"
    // thus we should fist convert bytes32 to bytes (to dynamically-sized byte array)

        bytes memory bytesArray = new bytes(32);
        for (uint256 i; i < 32; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
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
        require(_founders.length == _foundersTokenAmount.length);
        require(_founders.length == _foundersReputationAmount.length);
        require(_founders.length > 0);
        DAOToken nativeToken =
        DAOToken(address(app.create(PACKAGE_NAME, "DAOToken", msg.sender, _tokenInitData)));
        Reputation nativeReputation =
        Reputation(address(app.create(PACKAGE_NAME, "Reputation", msg.sender,
        abi.encodeWithSignature("initialize(address)", address(this)))));

        Avatar avatar = Avatar(address(app.create(PACKAGE_NAME, "Avatar", msg.sender,
        abi.encodeWithSignature(
            "initialize(string,address,address,address)",
            _orgName,
            address(nativeToken),
            address(nativeReputation),
            address(this)))));

         // Mint token and reputation for founders:
        for (uint256 i = 0; i < _founders.length; i++) {
            require(_founders[i] != address(0));
            if (_foundersTokenAmount[i] > 0) {
                nativeToken.mint(_founders[i], _foundersTokenAmount[i]);
            }
            if (_foundersReputationAmount[i] > 0) {
                nativeReputation.mint(_founders[i], _foundersReputationAmount[i]);
            }
        }
         // Create Controller:
        Controller controller =
        Controller(address(app.create(
        PACKAGE_NAME,
        "Controller",
        msg.sender,
        abi.encodeWithSignature("initialize(address)", address(avatar)))));

        // Add the DAO to the tracking registry
        daoTracker.track(avatar, controller);

         // Transfer ownership:
        avatar.transferOwnership(address(controller));
        nativeToken.transferOwnership(address(controller));
        nativeReputation.transferOwnership(address(controller));

        locks[address(avatar)] = msg.sender;

        emit NewOrg (address(avatar));
        return (address(avatar));
    }
}
