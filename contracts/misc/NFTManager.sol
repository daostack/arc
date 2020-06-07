pragma solidity ^0.5.17;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";

contract NFTManager is Initializable, Ownable, IERC721Receiver {
    function initialize() public initializer {
        Ownable.initialize(msg.sender);
    }

    /// @notice Safe Transfer specified NFT to a given recipient
    /// @param recipient Address to transfer NFT to
    /// @param nftContract NFT token contract to transfer from (e.g. Cryptokitties contract)
    /// @param tokenId ID of specific NFT to transfer
    function sendNFT(address recipient, IERC721 nftContract, uint tokenId) public onlyOwner {
        sendNFTWithData(recipient, nftContract, tokenId, "");
    }

    /// @notice Safe Transfer specified NFT to a given recipient, with arbitrary extra data
    /// @param recipient Address to transfer NFT to
    /// @param nftContract NFT token contract to transfer from (e.g. Cryptokitties contract)
    /// @param tokenId ID of specific NFT to transfer
    /// @param data Arbitrary data to transfer
    function sendNFTWithData(address recipient, IERC721 nftContract, uint tokenId, bytes memory data) public onlyOwner {
        nftContract.safeTransferFrom(address(this), recipient, tokenId, data);
    }

    /// @notice Transfer specified NFT to a given recipient, without extra safeTransferFrom() safeguards
    /// @param recipient Address to transfer NFT to
    /// @param nftContract NFT token contract to transfer from (e.g. Cryptokitties contract)
    /// @param tokenId ID of specific NFT to transfer
    function sendNFTNoSafeguards(address recipient, IERC721 nftContract, uint tokenId) public onlyOwner {
        nftContract.transferFrom(address(this), recipient, tokenId);
    }

    /**
     * @notice Handle the receipt of an NFT
     * @dev The ERC721 smart contract calls this function on the recipient
     * @dev The NFTManager uses this to notify other contracts that it accepts NFTs, and does not have any extra functionality on this hook.
     * after a {IERC721-safeTransferFrom}. This function MUST return the function selector,
     * otherwise the caller will revert the transaction. The selector to be
     * returned can be obtained as `this.onERC721Received.selector`. This
     * function MAY throw to revert and reject the transfer.
     * Note: the ERC721 contract address is always the message sender.
     * @param operator The address which called `safeTransferFrom` function
     * @param from The address which previously owned the token
     * @param tokenId The NFT identifier which is being transferred
     * @param data Additional data with no specified format
     * @return bytes4 `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
     */
    function onERC721Received(address operator, address from, uint256 tokenId, bytes memory data)
    public returns (bytes4)
    {
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    }

}