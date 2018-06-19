pragma solidity ^0.4.24;

import "../libs/OrderStatisticTree.sol";

contract TestOrderStatisticTree {
    using OrderStatisticTree for OrderStatisticTree.Tree;

    OrderStatisticTree.Tree tree;

    function insert(uint value) public {
        tree.insert(value);
    }

    function rank(uint value) public constant returns (uint) {
        return tree.rank(value);
    }

    function count() public view returns (uint) {
        return tree.count();
    }
}
