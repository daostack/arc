pragma solidity ^0.6.12;
// SPDX-License-Identifier: GPL-3.0

import "@daostack/infra-experimental/contracts/Reputation.sol";
import "./DAOToken.sol";
import "./Vault.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/SafeERC20.sol";


/**
 * @title An Avatar holds tokens, reputation and ether for a controller
 */
contract Avatar is Initializable, OwnableUpgradeSafe {
    using SafeERC20 for IERC20;

    string public orgName;
    DAOToken public nativeToken;
    Reputation public nativeReputation;
    Vault public vault;
    mapping(string=>string) public db;

    event GenericCall(address indexed _contract, bytes _data, uint _value, bool _success);
    event ExternalTokenTransfer(address indexed _externalToken, address indexed _to, uint256 _value);
    event ExternalTokenTransferFrom(address indexed _externalToken, address _from, address _to, uint256 _value);
    event ExternalTokenApproval(address indexed _externalToken, address _spender, uint256 _value);
    event MetaData(string _metaData);

    /**
    * @dev enables an avatar to receive ethers
    */
    /* solhint-disable */
    receive() external payable {
       if (msg.sender != address(vault)) {
          sendEthToVault();
        }
    }

    /**
    * @dev initialize takes organization name, native token and reputation system
    and creates an avatar for a controller
    */
    function initialize(string calldata _orgName,
                        DAOToken _nativeToken,
                        Reputation _nativeReputation,
                        address _owner)
    external
    initializer {
        orgName = _orgName;
        nativeToken = _nativeToken;
        nativeReputation = _nativeReputation;
        __Ownable_init_unchained();
        transferOwnership(_owner);
        vault = new Vault();
        vault.initialize(address(this));
    }

    /**
    * @dev perform a generic call to an arbitrary contract
    * @param _contract  the contract's address to call
    * @param _data ABI-encoded contract call to call `_contract` address.
    * @param _value value (ETH) to transfer with the transaction
    * @return success  success or fail
    *         returnValue - the return bytes of the called contract's function.
    */
    function genericCall(address _contract, bytes calldata _data, uint256 _value)
    external
    onlyOwner
    returns(bool success, bytes memory returnValue) {
        if (_value > 0) {
            vault.sendEther(_value, address(this));
        }
        // solhint-disable-next-line avoid-call-value
        (success, returnValue) = _contract.call{value:_value}(_data);
        emit GenericCall(_contract, _data, _value, success);
    }

    /**
    * @dev send ethers from the avatar's wallet
    * @param _amountInWei amount to send in Wei units
    * @param _to send the ethers to this address
    * @return bool which represents success
    */
    function sendEther(uint256 _amountInWei, address payable _to) external onlyOwner returns(bool) {
        vault.sendEther(_amountInWei, _to);
        return true;
    }

    /**
    * @dev external token transfer
    * @param _externalToken the token contract
    * @param _to the destination address
    * @param _value the amount of tokens to transfer
    * @return bool which represents success
    */
    function externalTokenTransfer(IERC20 _externalToken, address _to, uint256 _value)
    external onlyOwner returns(bool)
    {
        _externalToken.safeTransfer(_to, _value);
        emit ExternalTokenTransfer(address(_externalToken), _to, _value);
        return true;
    }

    /**
    * @dev external token transfer from a specific account
    * @param _externalToken the token contract
    * @param _from the account to spend token from
    * @param _to the destination address
    * @param _value the amount of tokens to transfer
    * @return bool which represents success
    */
    function externalTokenTransferFrom(
        IERC20 _externalToken,
        address _from,
        address _to,
        uint256 _value
    )
    external onlyOwner returns(bool)
    {
        _externalToken.safeTransferFrom(_from, _to, _value);
        emit ExternalTokenTransferFrom(address(_externalToken), _from, _to, _value);
        return true;
    }

    /**
    * @dev externalTokenApproval approve the spender address to spend a specified amount of tokens
    *      on behalf of msg.sender.
    * @param _externalToken the address of the Token Contract
    * @param _spender address
    * @param _value the amount of ether (in Wei) which the approval is referring to.
    * @return bool which represents a success
    */
    function externalTokenApproval(IERC20 _externalToken, address _spender, uint256 _value)
    external onlyOwner returns(bool)
    {
        _externalToken.safeApprove(_spender, _value);
        emit ExternalTokenApproval(address(_externalToken), _spender, _value);
        return true;
    }

    /**
    * @dev metaData emits an event with a string, should contain the hash of some meta data.
    * @param _metaData a string representing a hash of the meta data
    * @return bool which represents a success
    */
    function metaData(string calldata _metaData) external onlyOwner returns(bool) {
        emit MetaData(_metaData);
        return true;
    }

    /**
    * @dev setDBValue set a key value in the dao db
    * @param _key a string
    * @param _value a string
    * @return true if successful
    */
    function setDBValue(string calldata _key, string calldata _value) external onlyOwner returns(bool) {
        db[_key] = _value;
        return true;
    }

    /**
    * @dev sendEthToVault send eth to Vault. (if such balance exist)
    * For a case where ETH is beeing sent to the contrtact bypass the fallback function(e.g by destroyself).
    */
    function sendEthToVault() public {
        address(vault).transfer(address(this).balance);
    }

}
