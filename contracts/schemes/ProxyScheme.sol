pragma solidity ^0.4.24;

import "../controller/Avatar.sol";


/**
 * @title ProxyScheme
 * @dev A base contract for proxy based schemes
 */
contract ProxyScheme {
    Avatar public avatar;
    
    constructor () public {
        avatar = Avatar(0x000000000000000000000000000000000000dead);
    }
}