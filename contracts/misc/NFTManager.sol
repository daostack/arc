pragma solidity ^0.6.10;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";


contract NFTManager is Initializable, OwnableUpgradeSafe, IERC721Receiver {
    event SendNFT(address indexed recipient, IERC721 indexed nftContract, uint256 tokenId);

    function initialize(address _owner) external initializer {
        __Ownable_init_unchained();
        transferOwnership(_owner);
    }

    /// @notice Safe Transfer specified NFT to a given recipient, with arbitrary extra data
    /// @param recipient Address to transfer NFT to
    /// @param nftContract NFT token contract to transfer from (e.g. Cryptokitties contract)
    /// @param tokenId ID of specific NFT to transfer
    /// @param data Arbitrary data to transfer
    function sendNFT(address recipient, IERC721 nftContract, uint tokenId, bytes calldata data) external onlyOwner {
        nftContract.safeTransferFrom(address(this), recipient, tokenId, data);
        emit SendNFT(recipient, nftContract, tokenId);
    }

    /// @notice Transfer specified NFT to a given recipient, without extra safeTransferFrom() safeguards
    /// @param recipient Address to transfer NFT to
    /// @param nftContract NFT token contract to transfer from (e.g. Cryptokitties contract)
    /// @param tokenId ID of specific NFT to transfer
    function sendNFTNoSafeguards(address recipient, IERC721 nftContract, uint tokenId) external onlyOwner {
        nftContract.transferFrom(address(this), recipient, tokenId);
        emit SendNFT(recipient, nftContract, tokenId);
    }

    /**
     * @notice Handle the receipt of an NFT
     * @dev The ERC721 smart contract calls this function on the recipient
     * @dev The NFTManager uses this to notify other contracts that it accepts NFTs,
     * and does not have any extra functionality on this hook.
     * after a {IERC721-safeTransferFrom}. This function MUST return the function selector,
     * otherwise the caller will revert the transaction. The selector to be
     * returned can be obtained as `this.onERC721Received.selector`. This
     * function MAY throw to revert and reject the transfer.
     * Note: the ERC721 contract address is always the message sender.
     * @return bytes4 `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
     */
    function onERC721Received(address, address, uint256, bytes memory)
    public override returns (bytes4)
    {
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    }
}
