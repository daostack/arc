pragma solidity ^0.5.17;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";

contract NFTManager is Initializable, Ownable {
    function initialize() public initializer {
        Ownable.initialize(msg.sender);
    }

    /// @notice Transfer specified NFT to a given recipient
    /// @param recipient Address to transfer NFT to
    /// @param nftContract NFT token contract to transfer from (e.g. Cryptokitties contract)
    /// @param tokenId ID of specific NFT to transfer
    function sendNFT(address recipient, IERC721 nftContract, uint tokenId) external onlyOwner {
        nftContract.transferFrom(address(this), recipient, tokenId);
    }
}