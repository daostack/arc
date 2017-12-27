pragma solidity ^0.4.18;

import "../controller/Avatar.sol";

contract AvatarMock is AvatarInterface {
    function genericAction(address _action, bytes32[] _params) public onlyOwner returns(bool) {
        GenericAction(_action,_params);
    }
    function sendEther(uint _amountInWei, address _to) public onlyOwner returns(bool) {
        SendEther(_amountInWei,_to);
    }
    function externalTokenTransfer(StandardToken _externalToken, address _to, uint _value) public onlyOwner returns(bool) {
        ExternalTokenTransfer(_externalToken,_to,_value);
    }
    function externalTokenTransferFrom(
        StandardToken _externalToken,
        address _from,
        address _to,
        uint _value
    ) public onlyOwner returns(bool){
        ExternalTokenTransferFrom(
            _externalToken,
            _from,
            _to,
            _value
        );
    }
    function externalTokenIncreaseApproval(StandardToken _externalToken, address _spender, uint _addedValue) public onlyOwner returns(bool) {
        ExternalTokenIncreaseApproval(_externalToken, _spender, _addedValue);
    }
    function externalTokenDecreaseApproval(StandardToken _externalToken, address _spender, uint _subtractedValue) public onlyOwner returns(bool){
        ExternalTokenDecreaseApproval(_externalToken, _spender, _subtractedValue);
    }
}