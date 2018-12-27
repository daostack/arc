pragma solidity ^0.5.2;

import "../globalConstraints/GlobalConstraintInterface.sol";


contract GlobalConstraintMock {

    struct TestParam {
        bool pre;
        bool post;
    }

    mapping (bytes32=>TestParam) public testParams;

    GlobalConstraintInterface.CallPhase public currentCallPhase;

    function setConstraint(bytes32 method, bool pre, bool post) public returns(bool) {
        testParams[method].pre = pre;
        testParams[method].post = post;

        if (!pre && !post) {
            currentCallPhase = GlobalConstraintInterface.CallPhase.PreAndPost;
        } else {
            if (!pre) {
                currentCallPhase = GlobalConstraintInterface.CallPhase.Pre;
            } else if (!post) {
                currentCallPhase = GlobalConstraintInterface.CallPhase.Post;
            }
        }
        return true;
    }

    function pre(address, bytes32, bytes32 method) public view returns(bool) {
        return testParams[method].pre;
    }

    function post(address, bytes32, bytes32 method) public view returns(bool) {
        return testParams[method].post;
    }

    function when() public view returns(GlobalConstraintInterface.CallPhase) {
        return currentCallPhase;
    }
}
