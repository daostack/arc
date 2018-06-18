pragma solidity ^0.4.24;

import "../libs/OrderStatisticTree.sol";


contract OrderStatisticTreeMock {
    using OrderStatisticTree for OrderStatisticTree.Tree;

    OrderStatisticTree.Tree tree;

    function insert(uint value) public {
        tree.insert(value);
    }

    function rank(uint value) public view returns (uint) {
        return tree.rank(value);
    }

    function count() public view returns (uint) {
        return tree.count();
    }

    function remove(uint _value) public {
        return tree.remove(_value);
    }
}
