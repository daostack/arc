pragma solidity ^0.4.24;

import "@optionality.io/clone-factory/contracts/CloneFactory.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "../controller/Avatar.sol";
import "../constraints/TokenCapConstraint.sol";


contract ConstraintsFactory is Ownable, CloneFactory {

    address public tokenCapConstraintLibraryAddress;

    event TokenCapConstraintLibraryChanged(address indexed _newLibraryAddress, address indexed _previousLibraryAddress);
   
    event TokenCapConstraintCreated(address _newConstraintAddress);

    function setTokenCapConstraintLibraryAddress(address _tokenCapConstraintLibraryAddress) external onlyOwner {
        emit TokenCapConstraintLibraryChanged(_tokenCapConstraintLibraryAddress, tokenCapConstraintLibraryAddress);

        tokenCapConstraintLibraryAddress = _tokenCapConstraintLibraryAddress;
    }

    function createTokenCapConstraint(
        StandardToken _token,
        uint _cap
    ) public returns (address) 
    {
        address clone = createClone(tokenCapConstraintLibraryAddress);
        TokenCapConstraint(clone).init(
            _token,
            _cap
        );
        
        emit TokenCapConstraintCreated(clone);

        return clone;
    }
}