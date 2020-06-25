pragma solidity  ^0.6.10;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/IERC721Receiver.sol";

contract IERC721ReceiverMock is IERC721Receiver {
    function onERC721Received(address, address, uint256, bytes memory)
    public override returns (bytes4)
    {
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    }
}
