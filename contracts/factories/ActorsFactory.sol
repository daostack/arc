pragma solidity ^0.4.24;

import "@optionality.io/clone-factory/contracts/CloneFactory.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "@daostack/infra/contracts/Reputation.sol";
import "../controller/Avatar.sol";
import "../controller/DAOToken.sol";


contract ActorsFactory is Ownable, CloneFactory {

    address public avatarLibraryAddress;
    address public tokenLibraryAddress;

    event AvatarCreated(address newAvatarAddress);
    event DAOTokenCreated(address newTokenAddress);

    constructor (address _avatarLibraryAddress, address _tokenLibraryAddress) public {
        avatarLibraryAddress = _avatarLibraryAddress;
        tokenLibraryAddress = _tokenLibraryAddress;
    }

    function createAvatar(string _orgName, DAOToken _nativeToken, Reputation _nativeReputation) public returns (address) {
        address clone = createClone(avatarLibraryAddress);
        Avatar(clone).init(msg.sender, _orgName, _nativeToken, _nativeReputation);
        emit AvatarCreated(clone);
        return clone;
    }

    function createDAOToken(string _name, string _symbol, uint _cap) public returns (address) {
        address clone = createClone(tokenLibraryAddress);
        DAOToken(clone).init(msg.sender, _name, _symbol, _cap);
        emit DAOTokenCreated(clone);
        return clone;
    }
}