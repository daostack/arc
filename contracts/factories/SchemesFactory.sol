pragma solidity ^0.4.24;

import "@optionality.io/clone-factory/contracts/CloneFactory.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "../schemes/Auction4Reputation.sol";
import "../schemes/FixedReputationAllocation.sol";
import "../controller/Avatar.sol";


contract SchemesFactory is Ownable, CloneFactory {

    address public fixedReputationAllocationLibraryAddress;
    address public auction4ReputationLibraryAddress;

    event Auction4ReputationLibraryChanged(address indexed _newLibraryAddress, address indexed _previousLibraryAddress);
    event FixedReputationAllocationLibraryChanged(address indexed _newLibraryAddress, address indexed _previousLibraryAddress);

    event Auction4ReputationCreated(address _newSchemeAddress);
    event FixedReputationAllocationCreated(address _newSchemeAddress);

    function setAuction4ReputationLibraryAddress (address _auction4ReputationLibraryAddress) external onlyOwner {
        emit Auction4ReputationLibraryChanged(_auction4ReputationLibraryAddress, auction4ReputationLibraryAddress);

        auction4ReputationLibraryAddress = _auction4ReputationLibraryAddress;
    }

    function setFixedReputationAllocationLibraryAddress(address _fixedReputationAllocationLibraryAddress) external onlyOwner {
        emit FixedReputationAllocationLibraryChanged(_fixedReputationAllocationLibraryAddress, fixedReputationAllocationLibraryAddress);
        
        fixedReputationAllocationLibraryAddress = _fixedReputationAllocationLibraryAddress;
    }

    function createAuction4Reputation(
        Avatar _avatar,
        uint _reputationReward,
        uint _auctionsStartTime,
        uint _auctionsEndTime,
        uint _numberOfAuctions,
        StandardToken _token,
        address _wallet
    ) public returns (address) 
    {
        address clone = createClone(auction4ReputationLibraryAddress);
        Auction4Reputation(clone).init(
            msg.sender,
            _avatar,
            _reputationReward,
            _auctionsStartTime,
            _auctionsEndTime,
            _numberOfAuctions,
            _token,
            _wallet
        );
        
        emit Auction4ReputationCreated(clone);

        return clone;
    }

    function createFixedReputationAllocation(Avatar _avatar, uint _reputationReward) public returns (address) {
        address clone = createClone(fixedReputationAllocationLibraryAddress);
        FixedReputationAllocation(clone).init(msg.sender, _avatar, _reputationReward);
        
        emit FixedReputationAllocationCreated(clone);

        return clone;
    }
}