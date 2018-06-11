pragma solidity ^0.4.24;

import "./UniversalScheme.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/lifecycle/Destructible.sol";


/**
 * @title An avatar contract for ICO.
 * @dev Allow people to donate by simply sending ether to an address.
 */
contract MirrorContractICO is Destructible {
    Avatar public organization; // The organization address (the avatar)
    SimpleICO public simpleICO;  // The ICO contract address
    /**
    * @dev Constructor, setting the organization and ICO scheme.
    * @param _organization The organization's avatar.
    * @param _simpleICO The ICO Scheme.
    */
    constructor(Avatar _organization, SimpleICO _simpleICO) public {
        organization = _organization;
        simpleICO = _simpleICO;
    }

    /**
    * @dev Fallback function, when ether is sent it will donate to the ICO.
    * The ether will be returned if the donation is failed.
    */
    function () public payable {
        // Not to waste gas, if no value.
        require(msg.value != 0);

        // Return ether if couldn't donate.
        require(simpleICO.donate.value(msg.value)(organization, msg.sender) != 0);
    }
}


/**
 * @title SimpleICO scheme.
 * @dev A universal scheme to allow organizations to open a simple ICO and get donations.
 */
contract SimpleICO is UniversalScheme {
    using SafeMath for uint;

    // Struct holding the data for each organization
    struct Organization {
        bytes32 paramsHash; // Save the parameters approved by the org to open the ICO, so reuse of ICO will not change.
        address avatarContractICO; // Avatar is a contract for users that want to send ether without calling a function.
        uint totalEthRaised;
        bool isHalted; // The admin of the ICO can halt the ICO at any time, and also resume it.
    }

    // A mapping from hashes to parameters (use to store a particular configuration on the controller)
    struct Parameters {
        uint cap; // Cap in Eth
        uint price; // Price represents Tokens per 1 Eth
        uint startBlock;
        uint endBlock;
        address beneficiary; // all funds received will be transferred to this address.
        address admin; // The admin can halt or resume ICO.
    }

    // A mapping from the organization (Avatar) address to the saved data of the organization:
    mapping(address=>Organization) public organizationsICOInfo;

    mapping(bytes32=>Parameters) public parameters;

    event DonationReceived(address indexed organization, address indexed _beneficiary, uint _incomingEther, uint indexed _tokensAmount);

    /**
    * @dev Hash the parameters, save them if necessary, and return the hash value
    * @param _cap the ico cap
    * @param _price  represents Tokens per 1 Eth
    * @param _startBlock  ico start block
    * @param _endBlock ico end
    * @param _beneficiary the ico ether beneficiary
    * @param _admin the address of the ico admin which can hold and resume the ICO.
    * @return bytes32 -the params hash
    */
    function setParameters(
        uint _cap,
        uint _price,
        uint _startBlock,
        uint _endBlock,
        address _beneficiary,
        address _admin
    )
        public
        returns(bytes32)
    {
        require(_cap != 0);
        bytes32 paramsHash = getParametersHash(
            _cap,
            _price,
            _startBlock,
            _endBlock,
            _beneficiary,
            _admin
        );
        if (parameters[paramsHash].cap == 0) {
            parameters[paramsHash] = Parameters({
                cap: _cap,
                price: _price,
                startBlock: _startBlock,
                endBlock:_endBlock,
                beneficiary:_beneficiary,
                admin:_admin
            });
        }
        return paramsHash;
    }

    /**
    * @dev Hash the parameters and return the hash value
    * @param _cap the ico cap
    * @param _price  represents Tokens per 1 Eth
    * @param _startBlock  ico start block
    * @param _endBlock ico end
    * @param _beneficiary the ico ether beneficiary
    * @param _admin the address of the ico admin which can hold and resume the ICO.
    * @return bytes32 -the params hash
    */
    function getParametersHash(
        uint _cap,
        uint _price,
        uint _startBlock,
        uint _endBlock,
        address _beneficiary,
        address _admin
    )
        public
        pure
        returns(bytes32)
   {
        return (keccak256(
            abi.encodePacked(
            _cap,
            _price,
            _startBlock,
            _endBlock,
            _beneficiary,
            _admin
        )));
    }

    /**
     * @dev start an ICO
     * @param _avatar The Avatar's of the organization
     */
    function start(address _avatar) public {
        require(!isActive(_avatar));
        Organization memory org;
        org.paramsHash = getParametersFromController(Avatar(_avatar));
        require(parameters[org.paramsHash].cap != 0);
        org.avatarContractICO = new MirrorContractICO(Avatar(_avatar), this);
        organizationsICOInfo[_avatar] = org;
    }

    /**
     * @dev Allowing admin to halt an ICO.
     * @param _avatar The Avatar's of the organization
     */
    function haltICO(address _avatar) public {
        require(msg.sender == parameters[organizationsICOInfo[_avatar].paramsHash].admin);
        organizationsICOInfo[_avatar].isHalted = true;
    }

    /**
     * @dev Allowing admin to reopen an ICO.
     * @param _avatar The Avatar's of the organization
     */
    function resumeICO(address _avatar) public {
        require(msg.sender == parameters[organizationsICOInfo[_avatar].paramsHash].admin);
        organizationsICOInfo[_avatar].isHalted = false;
    }

    /**
     * @dev Check is an ICO is active (halted is still considered active). Active ICO:
     * 1. The organization is registered.
     * 2. The ICO didn't reach it's cap yet.
     * 3. The current block isn't bigger than the "endBlock" & Smaller then the "startBlock"
     * @param _avatar The Avatar's of the organization
     * @return bool which represents a successful of the function
     */
    function isActive(address _avatar) public view returns(bool) {
        Organization memory org = organizationsICOInfo[_avatar];
        Parameters memory params = parameters[org.paramsHash];

        if (org.totalEthRaised >= params.cap) {
            return false;
        }
        if (block.number >= params.endBlock) {
            return false;
        }
        if (block.number <= params.startBlock) {
            return false;
        }
        return true;
    }

    /**
     * @dev Donating ethers to get tokens.
     * If the donation is higher than the remaining ethers in the "cap",
     * The donator will get the change in ethers.
     * @param _avatar The Avatar's of the organization.
     * @param _beneficiary The donator's address - which will receive the ICO's tokens.
     * @return uint number of tokens minted for the donation.
     */
    function donate(Avatar _avatar, address _beneficiary) public payable returns(uint) {
        Organization memory org = organizationsICOInfo[_avatar];
        Parameters memory params = parameters[org.paramsHash];

        // Check ICO is active:
        require(isActive(_avatar));

        // Check ICO is not halted:
        require(!org.isHalted);


        uint incomingEther;
        uint change;

        // Compute how much tokens to buy:
        if ( msg.value > (params.cap).sub(org.totalEthRaised) ) {
            incomingEther = (params.cap).sub(org.totalEthRaised);
            change = (msg.value).sub(incomingEther);
        } else {
            incomingEther = msg.value;
        }

        uint tokens = incomingEther.mul(params.price);
        // Update total raised, call event and return amount of tokens bought:
        organizationsICOInfo[_avatar].totalEthRaised += incomingEther;
        // Send ether to the defined address, mint, and send change to beneficiary:
        params.beneficiary.transfer(incomingEther);

        require(ControllerInterface(_avatar.owner()).mintTokens(tokens, _beneficiary,address(_avatar)));
        if (change != 0) {
            _beneficiary.transfer(change);
        }
        emit DonationReceived(_avatar, _beneficiary, incomingEther, tokens);
        return tokens;
    }
}
