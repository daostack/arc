pragma solidity 0.5.17;

import "../controller/Controller.sol";

/**
 * @title A scheme for transitioning the DAO's assets to a new one.
 */

contract TransitionScheme {

    uint256 public constant ASSETS_CAP = 100;

    event OwnershipTransferred(Avatar indexed _avatar, address indexed _newAvatar, address indexed _asset);

    Avatar public avatar;
    address payable public newAvatar;
    address[] public externalTokens;
    address[] public assetAddresses;
    bytes4[] public selectors;

    /**
     * @dev initialize
     * @param _avatar the avatar to migrate from
     * @param _newAvatar the avatar to migrate to
     * @param _externalTokens external tokens to allow transfer to the new avatar
     * @param _assetAddresses the assets to transfer
     * @param _selectors the functions to call to to transfer the assets
     */
    function initialize(
        Avatar _avatar,
        address payable _newAvatar,
        address[] calldata _externalTokens,
        address[] calldata _assetAddresses,
        bytes4[] calldata _selectors
    ) external {
        require(_assetAddresses.length <= ASSETS_CAP, "cannot transfer more than 100 assets");
        require(_assetAddresses.length == _selectors.length, "Arrays length mismatch");
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");
        avatar = _avatar;
        newAvatar = _newAvatar;
        externalTokens = _externalTokens;
        assetAddresses = _assetAddresses;
        selectors = _selectors;
    }

    /**
     * @dev transferAssets function
     * transfer the DAO assets to a new DAO
     */
    function transferAssets() external {
        for (uint256 i=0; i < assetAddresses.length; i++) {
            bytes memory genericCallReturnValue;
            bool success;
            Controller controller = Controller(avatar.owner());
            (success, genericCallReturnValue) =
            controller.genericCall(
                assetAddresses[i],
                abi.encodeWithSelector(selectors[i], newAvatar),
                avatar,
                0
            );
            if (success) {
                emit OwnershipTransferred(avatar, newAvatar, assetAddresses[i]);
            }
        }
    }

    /**
     * @dev sendEther function
     * @param _amount the amount of ether to send to the new avatar
     */
    function sendEther(uint256 _amount) external {
        require(
            Controller(avatar.owner()).sendEther(_amount, newAvatar, avatar),
            "Sending ether should succeed"
        );
    }

    /**
     * @dev sendExternalToken function
     * @param _amounts the amounts of tokens to send to the new avatar
     */
    function sendExternalToken(uint256[] calldata _amounts) external {
        require(externalTokens.length == _amounts.length, "Arrays length mismatch");
        for (uint256 i=0; i < externalTokens.length; i++) {
            if (_amounts[i] > 0) {
                require(
                    Controller(avatar.owner()).externalTokenTransfer(
                        IERC20(externalTokens[i]),
                        newAvatar,
                        _amounts[i],
                        avatar
                    ),
                    "Sending external token should succeed"
                );
            }
        }
    }
}
