pragma solidity ^0.4.11;

import "./Controller.sol";
import "./Reputation.sol";
import "./MintableToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/token/StandardToken.sol";


contract ActionInterface {
    function action(bytes32[] _params) returns(bool);
}


/**
 * @title An Avatar holds tokens, reputation and ether for a controller
 */
contract Avatar is Ownable {
    bytes32 public orgName;
    MintableToken public nativeToken;
    Reputation public nativeReputation;

    event GenericAction(address indexed _action, bytes32[] _params);
    event SendEther(uint _amountInWei, address indexed _to);
    event ExternalTokenTransfer(address indexed _externalToken, address indexed _to, uint _value);
    event ExternalTokenTransferFrom(address indexed _externalToken, address _from, address _to, uint _value);
    event ExternalTokenApprove(StandardToken indexed _externalToken, address _spender, uint _value);
    event TokenDisapprove(address _token, uint _value);
    event ReceiveEther(address indexed _sender, uint _value);

    /**
     * @dev the constructor takes organization name, native token and reputation system
     and creates an avatar for a controller
     */
    function Avatar(bytes32 _orgName, MintableToken _nativeToken, Reputation _nativeReputation) {
        orgName = _orgName;
        nativeToken = _nativeToken;
        nativeReputation = _nativeReputation;
    }

    /**
     * @dev ???
     */
    function genericAction(ActionInterface _action, bytes32[] _params)
        onlyOwner returns(bool)
    {
        return _action.delegatecall(bytes4(sha3("action(uint256[])")), _params);
        GenericAction(_action, _params);
    }

    /**
     * @dev send ethers from the avatar's wallet
     * @param _amountInWei amount to send in Wei units
     * @param _to send the ethers to this address
     * @return bool which represents success
     */
    function sendEther(uint _amountInWei, address _to) onlyOwner returns(bool) {
        _to.transfer(_amountInWei);
        SendEther(_amountInWei, _to);
        return true;
    }

    function externalTokenTransfer(StandardToken _externalToken, address _to, uint _value)
        onlyOwner returns(bool)
    {
        _externalToken.transfer(_to, _value);
        ExternalTokenTransfer(_externalToken, _to, _value);
        return true;
    }

    function externalTokenTransferFrom(
        StandardToken _externalToken,
        address _from,
        address _to,
        uint _value)
        onlyOwner returns(bool)
    {
        _externalToken.transferFrom(_from, _to, _value);
        ExternalTokenTransferFrom(_externalToken, _from, _to, _value);
        return true;
    }

    function externalTokenApprove(StandardToken _externalToken, address _spender, uint _value)
        onlyOwner returns(bool)
    {
        _externalToken.approve(_spender, _value);
        ExternalTokenApprove(_externalToken, _spender, _value);
        return true;
    }

    function tokenDisapprove(StandardToken _token, uint _value ) onlyOwner returns(bool) {
        _token.transferFrom(msg.sender,msg.sender, _value);
        TokenDisapprove(_token, _value);
        return true;
    }

    /**
     * @dev enables an avatar to receive ethers
     */
    function() payable {
        ReceiveEther(msg.sender, msg.value);
    }

}
