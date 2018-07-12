pragma solidity ^0.4.24;


library OrderStatisticTree {

    struct Node {
        mapping (bool => uint) children; // a mapping of left(false) child and right(true) child nodes
        uint parent; // parent node
        bool side;   // side of the node on the tree (left or right)
        uint height; //Height of this node
        uint count; //Number of tree nodes below this node (including this one)
        uint dupes; //Number of duplicates values for this node
    }

    struct Tree {
        // a mapping between node value(uint) to Node
        // the tree's root is always at node 0 ,which points to the "real" tree
        // as its right child.this is done to eliminate the need to update the tree
        // root in the case of rotation.(saving gas).
        mapping(uint => Node) nodes;
    }
    /**
     * @dev rank - find the rank of a value in the tree,
     *      i.e. its index in the sorted list of elements of the tree
     * @param _tree the tree
     * @param _value the input value to find its rank.
     * @return smaller - the number of elements in the tree which their value is
     * less than the input value.
     */
    function rank(Tree storage _tree,uint _value) internal view returns (uint smaller) {
        if (_value != 0) {
            smaller = _tree.nodes[0].dupes;

            uint cur = _tree.nodes[0].children[true];
            Node storage currentNode = _tree.nodes[cur];

            while (true) {
                if (cur <= _value) {
                    if (cur<_value) {
                        smaller = smaller + 1+currentNode.dupes;
                    }
                    uint leftChild = currentNode.children[false];
                    if (leftChild!=0) {
                        smaller = smaller + _tree.nodes[leftChild].count;
                    }
                }
                if (cur == _value) {
                    break;
                }
                cur = currentNode.children[cur<_value];
                if (cur == 0) {
                    break;
                }
                currentNode = _tree.nodes[cur];
            }
        }
    }

    function count(Tree storage _tree) internal view returns (uint) {
        Node storage root = _tree.nodes[0];
        Node memory child = _tree.nodes[root.children[true]];
        return root.dupes+child.count;
    }

    function updateCount(Tree storage _tree,uint _value) private {
        Node storage n = _tree.nodes[_value];
        n.count = 1+_tree.nodes[n.children[false]].count+_tree.nodes[n.children[true]].count+n.dupes;
    }

    function updateCounts(Tree storage _tree,uint _value) private {
        uint parent = _tree.nodes[_value].parent;
        while (parent!=0) {
            updateCount(_tree,parent);
            parent = _tree.nodes[parent].parent;
        }
    }

    function updateHeight(Tree storage _tree,uint _value) private {
        Node storage n = _tree.nodes[_value];
        uint heightLeft = _tree.nodes[n.children[false]].height;
        uint heightRight = _tree.nodes[n.children[true]].height;
        if (heightLeft > heightRight)
            n.height = heightLeft+1;
        else
            n.height = heightRight+1;
    }

    function balanceFactor(Tree storage _tree,uint _value) private view returns (int bf) {
        Node storage n = _tree.nodes[_value];
        return int(_tree.nodes[n.children[false]].height)-int(_tree.nodes[n.children[true]].height);
    }

    function rotate(Tree storage _tree,uint _value,bool dir) private {
        bool otherDir = !dir;
        Node storage n = _tree.nodes[_value];
        bool side = n.side;
        uint parent = n.parent;
        uint valueNew = n.children[otherDir];
        Node storage nNew = _tree.nodes[valueNew];
        uint orphan = nNew.children[dir];
        Node storage p = _tree.nodes[parent];
        Node storage o = _tree.nodes[orphan];
        p.children[side] = valueNew;
        nNew.side = side;
        nNew.parent = parent;
        nNew.children[dir] = _value;
        n.parent = valueNew;
        n.side = dir;
        n.children[otherDir] = orphan;
        o.parent = _value;
        o.side = otherDir;
        updateHeight(_tree,_value);
        updateHeight(_tree,valueNew);
        updateCount(_tree,_value);
        updateCount(_tree,valueNew);
    }

    function rebalanceInsert(Tree storage _tree,uint _nValue) private {
        updateHeight(_tree,_nValue);
        Node storage n = _tree.nodes[_nValue];
        uint pValue = n.parent;
        if (pValue!=0) {
            int pBf = balanceFactor(_tree,pValue);
            bool side = n.side;
            int sign;
            if (side)
                sign = -1;
            else
                sign = 1;
            if (pBf == sign*2) {
                if (balanceFactor(_tree,_nValue) == (-1 * sign)) {
                    rotate(_tree,_nValue,side);
                }
                rotate(_tree,pValue,!side);
            } else if (pBf != 0) {
                rebalanceInsert(_tree,pValue);
            }
        }
    }

    function rebalanceDelete(Tree storage _tree,uint _pValue,bool side) private {
        if (_pValue!=0) {
            updateHeight(_tree,_pValue);
            int pBf = balanceFactor(_tree,_pValue);
            int sign;
            if (side)
                sign = 1;
            else
                sign = -1;
            int bf = balanceFactor(_tree,_pValue);
            if (bf==(2*sign)) {
                Node storage p = _tree.nodes[_pValue];
                uint sValue = p.children[!side];
                int sBf = balanceFactor(_tree,sValue);
                if (sBf == (-1 * sign)) {
                    rotate(_tree,sValue,!side);
                }
                rotate(_tree,_pValue,side);
                if (sBf!=0) {
                    p = _tree.nodes[_pValue];
                    rebalanceDelete(_tree,p.parent,p.side);
                }
            } else if (pBf != sign) {
                p = _tree.nodes[_pValue];
                rebalanceDelete(_tree,p.parent,p.side);
            }
        }
    }

    function fixParents(Tree storage _tree,uint parent,bool side) private {
        if (parent!=0) {
            updateCount(_tree,parent);
            updateCounts(_tree,parent);
            rebalanceDelete(_tree,parent,side);
        }
    }

    function insertHelper(Tree storage _tree,uint _pValue,bool _side,uint _value) private {
        Node storage root = _tree.nodes[_pValue];
        uint cValue = root.children[_side];
        if (cValue==0) {
            root.children[_side] = _value;
            Node storage child = _tree.nodes[_value];
            child.parent = _pValue;
            child.side = _side;
            child.height = 1;
            child.count = 1;
            updateCounts(_tree,_value);
            rebalanceInsert(_tree,_value);
        } else if (cValue==_value) {
            _tree.nodes[cValue].dupes++;
            updateCount(_tree,_value);
            updateCounts(_tree,_value);
        } else {
            insertHelper(_tree,cValue,(_value >= cValue),_value);
        }
    }

    function insert(Tree storage _tree,uint _value) internal {
        if (_value==0) {
            _tree.nodes[_value].dupes++;
        } else {
            insertHelper(_tree,0,true,_value);
        }
    }

    function rightmostLeaf(Tree storage _tree,uint _value) private view returns (uint leaf) {
        uint child = _tree.nodes[_value].children[true];
        if (child!=0) {
            return rightmostLeaf(_tree,child);
        } else {
            return _value;
        }
    }

    function zeroOut(Tree storage _tree,uint _value) private {
        Node storage n = _tree.nodes[_value];
        n.parent = 0;
        n.side = false;
        n.children[false] = 0;
        n.children[true] = 0;
        n.count = 0;
        n.height = 0;
        n.dupes = 0;
    }

    function removeBranch(Tree storage _tree,uint _value,uint _left) private {
        uint ipn = rightmostLeaf(_tree,_left);
        Node storage i = _tree.nodes[ipn];
        uint dupes = i.dupes;
        removeHelper(_tree,ipn);
        Node storage n = _tree.nodes[_value];
        uint parent = n.parent;
        Node storage p = _tree.nodes[parent];
        uint height = n.height;
        bool side = n.side;
        uint ncount = n.count;
        uint right = n.children[true];
        uint left = n.children[false];
        p.children[side] = ipn;
        i.parent = parent;
        i.side = side;
        i.count = ncount+dupes-n.dupes;
        i.height = height;
        i.dupes = dupes;
        if (left!=0) {
            i.children[false] = left;
            _tree.nodes[left].parent = ipn;
        }
        if (right!=0) {
            i.children[true] = right;
            _tree.nodes[right].parent = ipn;
        }
        zeroOut(_tree,_value);
        updateCounts(_tree,ipn);
    }

    function removeHelper(Tree storage _tree,uint _value) private {
        Node storage n = _tree.nodes[_value];
        uint parent = n.parent;
        bool side = n.side;
        Node storage p = _tree.nodes[parent];
        uint left = n.children[false];
        uint right = n.children[true];
        if ((left == 0) && (right == 0)) {
            p.children[side] = 0;
            zeroOut(_tree,_value);
            fixParents(_tree,parent,side);
        } else if ((left != 0) && (right != 0)) {
            removeBranch(_tree,_value,left);
        } else {
            uint child = left+right;
            Node storage c = _tree.nodes[child];
            p.children[side] = child;
            c.parent = parent;
            c.side = side;
            zeroOut(_tree,_value);
            fixParents(_tree,parent,side);
        }
    }

    function remove(Tree storage _tree,uint _value) internal {
        Node storage n = _tree.nodes[_value];
        if (_value==0) {
            if (n.dupes==0) {
                return;
            }
        } else {
            if (n.count==0) {
                return;
            }
        }
        if (n.dupes>0) {
            n.dupes--;
            if (_value!=0) {
                n.count--;
            }
            fixParents(_tree,n.parent,n.side);
        } else {
            removeHelper(_tree,_value);
        }
    }

}
