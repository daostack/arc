pragma solidity ^0.4.24;

library OrderStatisticTree {

    struct Node {
       mapping (bool => uint) children;
       uint parent;
       bool side;
       uint height;
       uint count;
       uint dupes;
    }

    struct Tree {
        mapping(uint => Node) nodes;
    }

    function rank(Tree storage tree ,uint value) internal view returns (uint smaller){
        if(value!=0){
            smaller=tree.nodes[0].dupes;

            uint cur=tree.nodes[0].children[true];
            Node storage cur_node = tree.nodes[cur];

            while(true){
                if (cur<=value){
                    if(cur<value){
                        smaller = smaller + 1+cur_node.dupes;
                      }
                    uint left_child = cur_node.children[false];
                    if (left_child!=0) {
                        smaller = smaller + tree.nodes[left_child].count;
                    }
                }
                if (cur == value) {
                    break;
                }
                cur=cur_node.children[cur<value];
                if (cur == 0) {
                  break;
                }
                cur_node=tree.nodes[cur];
            }
        }
    }

    function count(Tree storage tree) internal view returns (uint){
        Node storage root=tree.nodes[0];
        Node memory child=tree.nodes[root.children[true]];
        return root.dupes+child.count;
    }

    function update_count(Tree storage tree,uint value) private {
        Node storage n=tree.nodes[value];
        n.count=1+tree.nodes[n.children[false]].count+tree.nodes[n.children[true]].count+n.dupes;
    }

    function update_counts(Tree storage tree,uint value) private {
        uint parent=tree.nodes[value].parent;
        while (parent!=0) {
            update_count(tree,parent);
            parent=tree.nodes[parent].parent;
        }
    }

    function update_height(Tree storage tree,uint value) private {
        Node storage n=tree.nodes[value];
        uint height_left=tree.nodes[n.children[false]].height;
        uint height_right=tree.nodes[n.children[true]].height;
        if (height_left>height_right)
            n.height=height_left+1;
        else
            n.height=height_right+1;
    }

    function balance_factor(Tree storage tree,uint value) constant private returns (int bf) {
        Node storage n=tree.nodes[value];
        return int(tree.nodes[n.children[false]].height)-int(tree.nodes[n.children[true]].height);
    }

    function rotate(Tree storage tree,uint value,bool dir) private {
        bool other_dir=!dir;
        Node storage n=tree.nodes[value];
        bool side=n.side;
        uint parent=n.parent;
        uint value_new=n.children[other_dir];
        Node storage n_new=tree.nodes[value_new];
        uint orphan=n_new.children[dir];
        Node storage p=tree.nodes[parent];
        Node storage o=tree.nodes[orphan];
        p.children[side]=value_new;
        n_new.side=side;
        n_new.parent=parent;
        n_new.children[dir]=value;
        n.parent=value_new;
        n.side=dir;
        n.children[other_dir]=orphan;
        o.parent=value;
        o.side=other_dir;
        update_height(tree,value);
        update_height(tree,value_new);
        update_count(tree,value);
        update_count(tree,value_new);
    }

    function rebalance_insert(Tree storage tree,uint n_value) private {
        update_height(tree,n_value);
        Node storage n=tree.nodes[n_value];
        uint p_value=n.parent;
        if (p_value!=0) {
            int p_bf=balance_factor(tree,p_value);
            bool side=n.side;
            int sign;
            if (side)
                sign=-1;
            else
                sign=1;
            if (p_bf == sign*2) {
                if (balance_factor(tree,n_value) == (-1 * sign))
                    rotate(tree,n_value,side);
                rotate(tree,p_value,!side);
            }
            else if (p_bf != 0)
                rebalance_insert(tree,p_value);
        }
    }

    function rebalance_delete(Tree storage tree,uint p_value,bool side) private {
        if (p_value!=0) {
            update_height(tree,p_value);
            int p_bf=balance_factor(tree,p_value);
            int sign;
            if (side)
                sign=1;
            else
                sign=-1;
            int bf=balance_factor(tree,p_value);
            if (bf==(2*sign)) {
                Node storage p=tree.nodes[p_value];
                uint s_value=p.children[!side];
                int s_bf=balance_factor(tree,s_value);
                if (s_bf == (-1 * sign))
                    rotate(tree,s_value,!side);
                rotate(tree,p_value,side);
                if (s_bf!=0){
                    p=tree.nodes[p_value];
                    rebalance_delete(tree,p.parent,p.side);
                }
            }
            else if (p_bf != sign){
                p=tree.nodes[p_value];
                rebalance_delete(tree,p.parent,p.side);
            }
        }
    }

    function fix_parents(Tree storage tree,uint parent,bool side) private {
        if(parent!=0) {
            update_count(tree,parent);
            update_counts(tree,parent);
            rebalance_delete(tree,parent,side);
        }
    }

    function insert_helper(Tree storage tree,uint p_value,bool side,uint value) private {
        Node storage root=tree.nodes[p_value];
        uint c_value=root.children[side];
        if (c_value==0){
            root.children[side]=value;
            Node storage child=tree.nodes[value];
            child.parent=p_value;
            child.side=side;
            child.height=1;
            child.count=1;
            update_counts(tree,value);
            rebalance_insert(tree,value);
        }
        else if (c_value==value){
            tree.nodes[c_value].dupes++;
            update_count(tree,value);
            update_counts(tree,value);
        }
        else{
            bool side_new=(value >= c_value);
            insert_helper(tree,c_value,side_new,value);
        }
    }
    function insert(Tree storage tree,uint value) internal {
        if (value==0)
            tree.nodes[value].dupes++;
        else{
            insert_helper(tree,0,true,value);
        }
    }

    function rightmost_leaf(Tree storage tree,uint value) constant private returns (uint leaf) {
        uint child=tree.nodes[value].children[true];
        if (child!=0)
            return rightmost_leaf(tree,child);
        else
            return value;
    }

    function zero_out(Tree storage tree,uint value) private {
        Node storage n=tree.nodes[value];
        n.parent=0;
        n.side=false;
        n.children[false]=0;
        n.children[true]=0;
        n.count=0;
        n.height=0;
        n.dupes=0;
    }

    function remove_branch(Tree storage tree,uint value,uint left,uint right) private {
        uint ipn=rightmost_leaf(tree,left);
        Node storage i=tree.nodes[ipn];
        uint dupes=i.dupes;
        remove_helper(tree,ipn);
        Node storage n=tree.nodes[value];
        uint parent=n.parent;
        Node storage p=tree.nodes[parent];
        uint height=n.height;
        bool side=n.side;
        uint ncount=n.count;
        right=n.children[true];
        left=n.children[false];
        p.children[side]=ipn;
        i.parent=parent;
        i.side=side;
        i.count=ncount+dupes-n.dupes;
        i.height=height;
        i.dupes=dupes;
        if (left!=0) {
            i.children[false]=left;
            tree.nodes[left].parent=ipn;
        }
        if (right!=0) {
            i.children[true]=right;
            tree.nodes[right].parent=ipn;
        }
        zero_out(tree,value);
        update_counts(tree,ipn);
    }

    function remove_helper(Tree storage tree,uint value) private {
        Node storage n=tree.nodes[value];
        uint parent=n.parent;
        bool side=n.side;
        Node storage p=tree.nodes[parent];
        uint left=n.children[false];
        uint right=n.children[true];
        if ((left == 0) && (right == 0)) {
            p.children[side]=0;
            zero_out(tree,value);
            fix_parents(tree,parent,side);
        }
        else if ((left !=0) && (right != 0)) {
            remove_branch(tree,value,left,right);
        }
        else {
            uint child=left+right;
            Node storage c=tree.nodes[child];
            p.children[side]=child;
            c.parent=parent;
            c.side=side;
            zero_out(tree,value);
            fix_parents(tree,parent,side);
        }
    }

    function remove(Tree storage tree,uint value) internal {
        Node storage n=tree.nodes[value];
        if (value==0){
            if (n.dupes==0)
                return;
        }
        else{
            if (n.count==0)
                return;
        }
        if (n.dupes>0) {
            n.dupes--;
            if(value!=0)
                n.count--;
            fix_parents(tree,n.parent,n.side);
        }
        else
            remove_helper(tree,value);
    }

}
