pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

import "../controller/Avatar.sol";
import "../controller/ControllerInterface.sol";
import "./ProxyScheme.sol";


/**
 * @title SimpleICO scheme.
 * @dev A scheme to allow organizations to open a simple ICO and get donations.
 */
contract SimpleICO is ProxyScheme, Pausable {
    using SafeMath for uint;

    uint public cap; // Cap in Eth
    uint public price; // Price represents Tokens per 1 Eth
    uint public startBlock;
    uint public endBlock;
    address public beneficiary; // all funds received will be transferred to this address.

    uint public totalEthRaised;

    event DonationReceived(address indexed _beneficiary, uint _incomingEther, uint indexed _tokensAmount);
    
    /**
    * @dev Fallback function, when ether is sent it will donate to the ICO.
    * The ether will be returned if the donation is failed.
    */
    function () public payable {
        // Return ether if couldn't donate.
        require(donate(msg.sender) != 0);
    } 

    function init(
        address _owner,
        Avatar _avatar,
        uint _cap,
        uint _price,
        uint _startBlock,
        uint _endBlock,
        address _beneficiary
    ) external
    {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");
        require(_cap != 0, "cap must be greater than zero");

        avatar = _avatar;

        cap = _cap;
        price = _price;
        startBlock = _startBlock;
        endBlock = _endBlock;
        beneficiary = _beneficiary;
        owner = _owner;
    }

    /**
     * @dev Check is the ICO active (halted is still considered active). Active ICO:
     * 1. The ICO didn't reach it's cap yet.
     * 2. The current block isn't bigger than the "endBlock" & Smaller then the "startBlock"
     * @return bool which represents a successful of the function
     */
    function isActive() public view returns(bool) {
        if (totalEthRaised >= cap) {
            return false;
        }
        if (block.number >= endBlock) {
            return false;
        }
        if (block.number <= startBlock) {
            return false;
        }

        return true;
    }

    /**
     * @dev Donating ethers to get tokens.
     * If the donation is higher than the remaining ethers in the "cap",
     * The donator will get the change in ethers.
     * @param _beneficiary The donator's address - which will receive the ICO's tokens.
     * @return uint number of tokens minted for the donation.
     */
    function donate(address _beneficiary) public payable whenNotPaused returns(uint) {

        // Check ICO is active:
        require(isActive(), "ICO is not active");

        require(msg.value != 0, "No Ether were sent in the contribution");

        uint incomingEther;
        uint change;

        // Compute how much tokens to buy:
        if (msg.value > cap.sub(totalEthRaised)) {
            incomingEther = cap.sub(totalEthRaised);
            change = (msg.value).sub(incomingEther);
        } else {
            incomingEther = msg.value;
        }

        uint tokens = incomingEther.mul(price);
        // Update total raised, call event and return amount of tokens bought:
        totalEthRaised += incomingEther;
        // Send ether to the defined address, mint, and send change to beneficiary:
        beneficiary.transfer(incomingEther);

        require(ControllerInterface(avatar.owner()).mintTokens(tokens, _beneficiary));
        
        if (change != 0) {
            _beneficiary.transfer(change);
        }

        emit DonationReceived(_beneficiary, incomingEther, tokens);

        return tokens;
    }
}
