pragma solidity ^0.4.24;

import "@optionality.io/clone-factory/contracts/CloneFactory.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "../schemes/SimpleICO.sol";
import "../controller/Avatar.sol";


contract SchemesFactory is Ownable, CloneFactory {

    address public simpleICOLibraryAddress;
    

    event SimpleICOLibraryChanged(address indexed _newLibraryAddress, address indexed _previousLibraryAddress);

    event SimpleICOCreated(address _newSchemeAddress);

    function setSimpleICOLibraryAddress(address _simpleICOLibraryAddress) external onlyOwner {
        emit SimpleICOLibraryChanged(_simpleICOLibraryAddress, simpleICOLibraryAddress);

        simpleICOLibraryAddress = _simpleICOLibraryAddress;
    }

    function createSimpleICO(
        Avatar _avatar,
        uint _cap,
        uint _price,
        uint _startBlock,
        uint _endBlock,
        address _beneficiary
    ) public returns (address) 
    {
        address clone = createClone(simpleICOLibraryAddress);
        SimpleICO(clone).init(
            msg.sender,
            _avatar,
            _cap,
            _price,
            _startBlock,
            _endBlock,
            _beneficiary
        );
        
        emit SimpleICOCreated(clone);

        return clone;
    }
}