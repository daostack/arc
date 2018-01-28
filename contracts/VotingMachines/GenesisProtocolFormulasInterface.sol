pragma solidity ^0.4.18;


interface GenesisProtocolFormulasInterface {

    function shouldBoost(bytes32 _proposalId) public view returns (bool);

    function score(bytes32 _proposalId) public view returns (uint);

    function threshold(address _avatar) public view returns (uint);

    function redeemAmount(bytes32 _proposalId,address _staker) public view returns (uint);

}
