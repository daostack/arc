pragma solidity  ^0.6.10;
// SPDX-License-Identifier: GPL-3.0

import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/ERC721.sol";



contract ERC721Mock is Initializable, ERC721UpgradeSafe, OwnableUpgradeSafe {

    function initialize(address _owner) public initializer {
        __ERC721_init_unchained("ERC721Mock", "721");
        __Ownable_init_unchained();
        transferOwnership(_owner);
    }

    function mint(address _to, uint256 _tokenId) public onlyOwner returns (bool) {
        _mint(_to, _tokenId);
        return true;
    }
}
