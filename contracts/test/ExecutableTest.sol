pragma solidity ^0.4.21;

import "./Debug.sol";
import "../universalSchemes/ExecutableInterface.sol";


contract ExecutableTest is ExecutableInterface, Debug {

    function execute(bytes32 _proposalId, address _avatar, int _param) public returns(bool) {
        emit LogBytes32(_proposalId);
        emit LogAddress(_avatar);
        emit LogInt(_param);
        return true;
    }
}
