pragma solidity ^0.4.18;



contract GlobalConstraintMock {

    struct TestParam {
        bool pre;
        bool post;
    }
    mapping (bytes=>TestParam) testParams;

    function setConstraint(bytes method,bool pre,bool post) public returns(bool) {
        testParams[method].pre = pre;
        testParams[method].post = post;
    }

    function pre(address, bytes32, bytes method) public view returns(bool) {
        return testParams[method].pre;
    }

    function post(address, bytes32 , bytes method) public view returns(bool) {
        return testParams[method].post;
    }
}
