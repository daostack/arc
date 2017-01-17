pragma solidity ^0.4.4;

/*
    A contract you can inherit from that has some useful Events to print statements.
*/
contract Debug {
    event PrintAddress(address msg);
    event PrintString(string msg);
    event PrintUint(uint msg);
    event PrintBytes(bytes msg);
}
 