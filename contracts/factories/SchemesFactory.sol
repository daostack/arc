pragma solidity ^0.4.24;

import "@optionality.io/clone-factory/contracts/CloneFactory.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "../schemes/FixedReputationAllocation.sol";
import "../controller/Avatar.sol";


contract SchemesFactory is Ownable, CloneFactory {

    address public fixedReputationAllocationLibraryAddress;

    event FixedReputationAllocationCreated(address newSchemeAddress);

    constructor (
        address _fixedReputationAllocationLibraryAddress
    ) public {
        fixedReputationAllocationLibraryAddress = _fixedReputationAllocationLibraryAddress;
    }

    function createFixedReputationAllocation(Avatar _avatar, uint _reputationReward) public returns (address) {
        address clone = createClone(fixedReputationAllocationLibraryAddress);
        FixedReputationAllocation(clone).init(msg.sender, _avatar, _reputationReward);
        
        emit FixedReputationAllocationCreated(clone);

        return clone;
    }
}