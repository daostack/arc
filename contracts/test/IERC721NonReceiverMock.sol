pragma solidity  ^0.5.17;

contract IERC721NonReceiverMock {
    function onERC721Received(address operator, address from, uint256 tokenId, bytes memory data)
    public returns (bytes4)
    {
        return bytes4(keccak256("Don't Receive ERC721"));
    }
}