pragma solidity ^0.4.15;

import "./Debug.sol";
import "../universalSchemes/ExecutableInterface.sol";


contract ExecutableTest is ExecutableInterface, Debug {

    function execute(bytes32 _proposalId, address _avatar, int _param) returns(bool) {
          LogBytes32(_proposalId);
          LogAddress(_avatar);
          LogInt(_param);
          return true;
    }
}
