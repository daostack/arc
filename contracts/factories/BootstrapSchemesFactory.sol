pragma solidity ^0.4.24;

import "@optionality.io/clone-factory/contracts/CloneFactory.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "../schemes/bootstrapSchemes/Auction4Reputation.sol";
import "../schemes/bootstrapSchemes/ExternalLocking4Reputation.sol";
import "../schemes/bootstrapSchemes/FixedReputationAllocation.sol";
import "../schemes/bootstrapSchemes/LockingEth4Reputation.sol";
import "../schemes/bootstrapSchemes/LockingToken4Reputation.sol";


contract BootstrapSchemesFactory is Ownable, CloneFactory {

    address public auction4ReputationLibraryAddress;
    address public externalLocking4ReputationLibraryAddress;
    address public fixedReputationAllocationLibraryAddress;
    address public lockingEth4ReputationLibraryAddress;
    address public lockingToken4ReputationLibraryAddress;

    event Auction4ReputationLibraryChanged(address indexed _newLibraryAddress, address indexed _previousLibraryAddress);
    event ExternalLocking4ReputationLibraryChanged(address indexed _newLibraryAddress, address indexed _previousLibraryAddress);
    event FixedReputationAllocationLibraryChanged(address indexed _newLibraryAddress, address indexed _previousLibraryAddress);
    event LockingEth4ReputationLibraryChanged(address indexed _newLibraryAddress, address indexed _previousLibraryAddress);
    event LockingToken4ReputationLibraryChanged(address indexed _newLibraryAddress, address indexed _previousLibraryAddress);

    event Auction4ReputationCreated(address _newSchemeAddress);
    event ExternalLocking4ReputationCreated(address _newSchemeAddress);
    event FixedReputationAllocationCreated(address _newSchemeAddress);
    event LockingEth4ReputationCreated(address _newSchemeAddress);
    event LockingToken4ReputationCreated(address _newSchemeAddress);

    function setAuction4ReputationLibraryAddress (address _auction4ReputationLibraryAddress) external onlyOwner {
        emit Auction4ReputationLibraryChanged(_auction4ReputationLibraryAddress, auction4ReputationLibraryAddress);

        auction4ReputationLibraryAddress = _auction4ReputationLibraryAddress;
    }

    function setExternalLocking4ReputationLibraryAddress (address _externalLocking4ReputationLibraryAddress) external onlyOwner {
        emit Auction4ReputationLibraryChanged(_externalLocking4ReputationLibraryAddress, externalLocking4ReputationLibraryAddress);

        externalLocking4ReputationLibraryAddress = _externalLocking4ReputationLibraryAddress;
    }

    function setFixedReputationAllocationLibraryAddress(address _fixedReputationAllocationLibraryAddress) external onlyOwner {
        emit FixedReputationAllocationLibraryChanged(_fixedReputationAllocationLibraryAddress, fixedReputationAllocationLibraryAddress);
        
        fixedReputationAllocationLibraryAddress = _fixedReputationAllocationLibraryAddress;
    }

    function setLockingEth4ReputationLibraryAddress(address _lockingEth4ReputationLibraryAddress) external onlyOwner {
        emit LockingEth4ReputationLibraryChanged(_lockingEth4ReputationLibraryAddress, lockingEth4ReputationLibraryAddress);
        
        lockingEth4ReputationLibraryAddress = _lockingEth4ReputationLibraryAddress;
    }

    function setLockingToken4ReputationLibraryAddress(address _lockingToken4ReputationLibraryAddress) external onlyOwner {
        emit LockingToken4ReputationLibraryChanged(_lockingToken4ReputationLibraryAddress, lockingToken4ReputationLibraryAddress);
        
        lockingToken4ReputationLibraryAddress = _lockingToken4ReputationLibraryAddress;
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

    function createExternalLocking4Reputation(
        Avatar _avatar,
        uint _reputationReward,
        uint _lockingStartTime,
        uint _lockingEndTime,
        address _externalLockingContract,
        string _getBalanceFuncSignature
    ) public returns (address) 
    {
        address clone = createClone(externalLocking4ReputationLibraryAddress);
        ExternalLocking4Reputation(clone).init(
            _avatar,
            _reputationReward,
            _lockingStartTime,
            _lockingEndTime,
            _externalLockingContract,
            _getBalanceFuncSignature
        );
        
        emit ExternalLocking4ReputationCreated(clone);

        return clone;
    }

    function createFixedReputationAllocation(Avatar _avatar, uint _reputationReward) public returns (address) {
        address clone = createClone(fixedReputationAllocationLibraryAddress);
        FixedReputationAllocation(clone).init(msg.sender, _avatar, _reputationReward);
        
        emit FixedReputationAllocationCreated(clone);

        return clone;
    }

    function createLockingEth4Reputation(
        Avatar _avatar,
        uint _reputationReward,
        uint _lockingStartTime,
        uint _lockingEndTime,
        uint _maxLockingPeriod
    ) public returns (address) 
    {
        address clone = createClone(lockingEth4ReputationLibraryAddress);
        LockingEth4Reputation(clone).init(
            _avatar,
            _reputationReward,
            _lockingStartTime,
            _lockingEndTime,
            _maxLockingPeriod
        );
        
        emit LockingEth4ReputationCreated(clone);

        return clone;
    }

    function createLockingToken4Reputation(
        Avatar _avatar,
        uint _reputationReward,
        uint _lockingStartTime,
        uint _lockingEndTime,
        uint _maxLockingPeriod,
        StandardToken _token
    ) public returns (address) 
    {
        address clone = createClone(lockingToken4ReputationLibraryAddress);
        LockingToken4Reputation(clone).init(
            _avatar,
            _reputationReward,
            _lockingStartTime,
            _lockingEndTime,
            _maxLockingPeriod,
            _token
        );
        
        emit LockingToken4ReputationCreated(clone);

        return clone;
    }
}