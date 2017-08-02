pragma solidity ^0.4.4;

/*
    A contract you can inherit from that has some useful Events to print statements.
*/
contract Debug {
    event LogAddress(address msg);
    event LogInt(int msg);
    event LogString(string msg);
    event LogUint(uint msg);
    event LogBytes(bytes msg);
    event LogBytes32(bytes32 msg);
    event LogBool(bool msg);
}
