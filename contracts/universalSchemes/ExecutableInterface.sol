pragma solidity ^0.4.18;

import "../controller/Controller.sol";


contract ExecutableInterface {
    function execute(bytes32 _proposalId, address _avatar, int _param) external returns(bool);
}
