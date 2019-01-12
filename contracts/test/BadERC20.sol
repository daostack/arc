pragma solidity ^0.5.2;

//this is a mock to simulate bad ERC20 token implementation as describe at
//https://github.com/ethereum/solidity/issues/4116
contract BadERC20 {

    mapping(address => uint256) public balances;
    mapping (address => mapping (address => uint256)) public allowance;

    function transfer(address _to, uint256 _value) public {
        balances[_to] = _value;
    }

    function transferFrom(address, address _to, uint256 _value) public {
        balances[_to] += _value;
    }

    function approve(address _spender, uint256 _value) public {
        allowance[msg.sender][_spender] = _value;
    }

}
