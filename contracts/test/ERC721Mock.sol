pragma solidity  ^0.5.17;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/ERC721Mintable.sol";

contract ERC721Mock is Initializable, ERC721Mintable {
    function __ERC721Mock_initialize() public initializer {
        ERC721.initialize();
        ERC721Mintable.initialize(msg.sender);
    }
}