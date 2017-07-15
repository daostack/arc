pragma solidity ^0.4.11;

import "./Controller.sol";
import "./Reputation.sol";
import "./MintableToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/token/StandardToken.sol";

contract ActionInterface {
    function action( uint _param ) returns(bool);
}

/**
 * @title An Avatar holds tokens, reputation and ether for a controller
 */
contract Avatar is Ownable {
  bytes32         public   orgName;
  MintableToken   public   nativeToken;
  Reputation      public   nativeReputation;

  event GenericAction( address indexed _action, uint _param );
  event SendEther( uint _amountInWei, address indexed _to );
  event ExternalTokenTransfer(address indexed _externalToken, address indexed _to, uint _value);
  event ExternalTokenTransferFrom(address indexed _externalToken, address _from, address _to, uint _value);
  event ExternalTokenApprove(StandardToken indexed _externalToken, address _spender, uint _value);
  event TokenDisapprove(address _token, uint _value );
  event ReceiveEther(address indexed _sender, uint _value);

  function Avatar(bytes32 _orgName, MintableToken _nativeToken, Reputation _nativeReputation) {
    orgName = _orgName;
    nativeToken = _nativeToken;
    nativeReputation = _nativeReputation;
  }

  function genericAction( ActionInterface _action, uint _param ) // TODO discuss name
  onlyOwner returns(bool){
      GenericAction( _action, _param );
      return _action.delegatecall(bytes4(sha3("action(uint256)")), _param);
  }

  function sendEther( uint _amountInWei, address _to ) onlyOwner returns(bool) {
      _to.transfer(_amountInWei);
      SendEther(_amountInWei, _to);
      return true;
  }

  function externalTokenTransfer(StandardToken _externalToken, address _to, uint _value)
      onlyOwner returns(bool) {
      ExternalTokenTransfer(_externalToken, _to, _value);
      _externalToken.transfer(_to, _value);
      return true;
  }

  function externalTokenTransferFrom(StandardToken _externalToken, address _from, address _to, uint _value)
      onlyOwner returns(bool) {
      ExternalTokenTransferFrom(_externalToken, _from, _to, _value);
      _externalToken.transferFrom( _from, _to, _value );
      return true;
  }

  function externalTokenApprove(StandardToken _externalToken, address _spender, uint _value)
      onlyOwner returns(bool) {
      ExternalTokenApprove(_externalToken, _spender, _value);
      _externalToken.approve(_spender, _value);
      return true;
  }

  function tokenDisapprove(StandardToken _token, uint _value ) onlyOwner returns(bool) {
      TokenDisapprove(_token, _value);
      _token.transferFrom( msg.sender,msg.sender, _value);
      return true;
  }

  function() payable {
      ReceiveEther(msg.sender, msg.value);
  }

}
