pragma solidity ^0.4.18;

import "./Controller.sol";
import "./Reputation.sol";
import "./DAOToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/token/StandardToken.sol";


contract ActionInterface {
    function action(bytes32[] _params) public returns(bool);
}


/**
 * @title An Avatar holds tokens, reputation and ether for a controller
 */
contract Avatar is Ownable {
    bytes32 public orgName;
    DAOToken public nativeToken;
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
    function Avatar(bytes32 _orgName, DAOToken _nativeToken, Reputation _nativeReputation) public {
        orgName = _orgName;
        nativeToken = _nativeToken;
        nativeReputation = _nativeReputation;
    }

    /**
    * @dev enables an avatar to receive ethers
    */
    function() public payable {
        ReceiveEther(msg.sender, msg.value);
    }

    /**
    * @dev ???
    */
    function genericAction(ActionInterface _action, bytes32[] _params)
    public onlyOwner returns(bool)
    {
        GenericAction(_action, _params);
        return _action.delegatecall(bytes4(keccak256("action(uint256[])")), _params);
    }

    /**
    * @dev send ethers from the avatar's wallet
    * @param _amountInWei amount to send in Wei units
    * @param _to send the ethers to this address
    * @return bool which represents success
    */
    function sendEther(uint _amountInWei, address _to) public onlyOwner returns(bool) {
        _to.transfer(_amountInWei);
        SendEther(_amountInWei, _to);
        return true;
    }

    function externalTokenTransfer(StandardToken _externalToken, address _to, uint _value)
    public onlyOwner returns(bool)
    {
        _externalToken.transfer(_to, _value);
        ExternalTokenTransfer(_externalToken, _to, _value);
        return true;
    }

    function externalTokenTransferFrom(
        StandardToken _externalToken,
        address _from,
        address _to,
        uint _value
    )
    public onlyOwner returns(bool)
    {
        _externalToken.transferFrom(_from, _to, _value);
        ExternalTokenTransferFrom(_externalToken, _from, _to, _value);
        return true;
    }

    function externalTokenApprove(StandardToken _externalToken, address _spender, uint _value)
    public onlyOwner returns(bool)
    {
        _externalToken.approve(_spender, _value);
        ExternalTokenApprove(_externalToken, _spender, _value);
        return true;
    }

    function tokenDisapprove(StandardToken _token, uint _value ) public onlyOwner returns(bool) {
        _token.transferFrom(msg.sender,msg.sender, _value);
        TokenDisapprove(_token, _value);
        return true;
    }

}
