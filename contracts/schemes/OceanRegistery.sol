pragma solidity 0.5.13;

import "../controller/Controller.sol";


/**
 * @title OceanRegistery.
 * @dev  A scheme for registering an asset at ocean project
 * once submitting an assst a user will gain reputation.
 */
contract OceanRegistery {

    event SumbitAsset(address indexed _avatar,
                    address indexed _submitter,
                    bytes32 indexed _did,
                    bytes _callReturnValue);

    address public didRegisteryAddress;
    uint256 public reputation4Submittion;
    Avatar public avatar;

    /**
     * @dev initialize
     * @param _avatar the avatar to mint reputation from
     * @param _didRegisteryAddress the did registery address
     * https://github.com/oceanprotocol/keeper-contracts/blob/develop/contracts/registry/DIDRegistry.sol
     * @param _reputation4Submittion reputation reward for submittion.
     */
    function initialize(
        Avatar _avatar,
        address _didRegisteryAddress,
        uint256 _reputation4Submittion
    )
    external
    {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");
        avatar = _avatar;
        didRegisteryAddress = _didRegisteryAddress;
        reputation4Submittion = _reputation4Submittion;
    }

    /**
    * @dev submit and register an asset to ocean
    */
    function submit(
                    bytes32 _did,
                    bytes32 _checksum,
                    address[] calldata _providers,
                    string calldata _value)
    external {
        Controller controller = Controller(avatar.owner());
        bool success;
        bytes memory callReturnValue;
        (success, callReturnValue) = controller.genericCall(
        didRegisteryAddress,
        abi.encodeWithSignature("registerAttribute(bytes32,bytes32,address[],string)",
        _did,
        _checksum,
        _providers,
        _value),
        avatar,
        0
        );
        require(success);
        require(
        Controller(
        avatar.owner()).mintReputation(reputation4Submittion, msg.sender, address(avatar)));
        emit SumbitAsset(address(avatar), msg.sender, _did, callReturnValue);
    }
}
