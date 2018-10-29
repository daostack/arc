pragma solidity ^0.4.24;

import "../constraints/ConstraintInterface.sol";


contract ConstraintMock {
    bool isPre;
    bool isPost;

    ConstraintInterface.CallPhase public currentCallPhase;

    function setConstraint(bool _pre, bool _post) public returns(bool) {
        isPre = _pre;
        isPost = _post;

        if (!_pre && !_post) {
            currentCallPhase = ConstraintInterface.CallPhase.PreAndPost;
        } else {
            if (!_pre) {
                currentCallPhase = ConstraintInterface.CallPhase.Pre;
          } else if (!_post) {
                     currentCallPhase = ConstraintInterface.CallPhase.Post;
          }
        }
        return true;
    }

    function pre(address, bytes32) public view returns(bool) {
        return isPre;
    }

    function post(address, bytes32) public view returns(bool) {
        return isPost;
    }

    function when() public view returns(ConstraintInterface.CallPhase) {
        return currentCallPhase;
    }
}
