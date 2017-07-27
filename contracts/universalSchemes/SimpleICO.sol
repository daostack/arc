pragma solidity ^0.4.11;

import "./UniversalScheme.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/lifecycle/Destructible.sol";


/**
 * @title An avatar contract for ICO.
 * @dev Allow people to donate by simply sending ether to an address.
 */
contract MirrorContractICO is Destructible {
  Avatar public organization; // The organization address (the avatar)
  SimpleICO public simpleICO;  // The ICO contract address

  // Contstructor, setting the organization and ICO scheme:
  function MirrorContractICO(Avatar _organization, SimpleICO _simpleICO) {
    organization = _organization;
    simpleICO = _simpleICO;
  }

  // Fallback function,when ether is sent it will donate to the ICO.
  function () payable {
    // Not to waste gas, if no value.
    require(msg.value != 0);

    // Return ether if couln't donate.
    if (simpleICO.donate.value(msg.value)(organization, msg.sender) == 0) revert();
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
      bytes32 paramsHash; // Save the parameters approved by the org to open the ICO, so reules of ICO will not change.
      address avatarContractICO; // Avatar is a contract for users that want to send eth without calling a funciton.
      uint totalEthRaised;
      bool isHalted; // The admin of the ICO can halt the ICO at any time, and also resume it.
      bool isRegistered;
    }

    // A mapping from hashes to parameters (use to store a particular configuration on the controller)
    // TODO: rename "etherAddress" to "beneficiary", in line with the other contracts
    struct Parameters {
        uint cap; // Cap in Eth
        uint price; // Price represents Tokens per 1 Eth
        uint startBlock;
        uint endBlock;
        address etherAddress; // all funds received will be transffered to this address.
        address admin; // The admin can halt or resume ICO.
    }

    // A mapping from the organization (Avatar) address to the saved data of the organization:
    mapping(address=>Organization) public organizations;

    mapping(bytes32=>Parameters) parameters;

    event DonationReceived( address indexed organization, address indexed _beneficiary, uint _incomingEther  ,uint indexed _tokensAmount );

    // Constructor, updating the initial prarmeters:
    function SimpleICO(StandardToken _nativeToken, uint _fee, address _beneficiary) {
        updateParameters(_nativeToken, _fee, _beneficiary, bytes32(0));
    }

    /**
     * @dev hash the parameters, save them if necessary, and return the hash value
     */
    function setParameters(
        uint _cap,
        uint _price,
        uint _startBlock,
        uint _endBlock,
        address _etherAddress,
        address _admin)  returns(bytes32) {
        bytes32 paramsHash = getParametersHash(_cap, _price, _startBlock, _endBlock, _etherAddress, _admin);
        if (parameters[paramsHash].cap != 0)  {
            parameters[paramsHash].cap = _cap;
            parameters[paramsHash].price = _price;
            parameters[paramsHash].startBlock = _startBlock;
            parameters[paramsHash].endBlock = _endBlock;
            parameters[paramsHash].etherAddress = _etherAddress;
            parameters[paramsHash].admin = _admin;
        }
        return paramsHash;
    }

    // The format of the hashing of the parameters:
    function getParametersHash(
      uint _cap,
      uint _price,
      uint _startBlock,
      uint _endBlock,
      address _etherAddress,
      address _admin) constant returns(bytes32) {
        return (sha3(_cap, _price, _startBlock, _endBlock, _etherAddress, _admin));
    }

    // Adding an organization to the universal scheme, and opens an ICO for it:
    function registerOrganization(Avatar _avatar) {
      // Pay fees for using scheme:
      if (fee > 0)
        nativeToken.transferFrom(_avatar, beneficiary, fee);

      // Check there is no ongoing ICO:
      require(! isActiveICO(_avatar));

      // Set the organization data:
      Organization memory org;
      org.isRegistered = true;
      org.paramsHash = getParametersFromController(_avatar);
      require(parameters[org.paramsHash].cap != 0);
      org.avatarContractICO = new MirrorContractICO(_avatar, this);
      organizations[_avatar] = org;
      LogOrgRegistered(_avatar);
    }

    // If someone accidentally sends ether to this contract, revert;
    function () {
        revert();
    }

    // Admin can halt ICO:
    function haltICO(address _avatar) {
        require(msg.sender == parameters[organizations[_avatar].paramsHash].admin);
        organizations[_avatar].isHalted = true;
    }

    // Admin can reopen ICO:
    function resumeICO(address _avatar) {
        require(msg.sender == parameters[organizations[_avatar].paramsHash].admin);
        organizations[_avatar].isHalted = false;
    }

    // Check if an ICO is active (halted is still considered active)
    function isActiveICO(address _avatar) constant returns(bool) {
        Organization memory org = organizations[_avatar];
        Parameters memory params = parameters[org.paramsHash];
        if (! org.isRegistered) return false;
        if (org.totalEthRaised >= params.cap) return false;
        if (block.number >= params.endBlock) return false;
        if (block.number <= params.startBlock) return false;
        return true;
    }

    // Donating ethers to get tokens:
    function donate(Avatar _avatar, address _beneficiary) payable returns(uint) {
        Organization memory org = organizations[_avatar];
        Parameters memory params = parameters[org.paramsHash];

        // Check ICO is active:
        require(isActiveICO(_avatar));

        // Check ICO is not halted:
        require(! org.isHalted);

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

        // Send ether to the defined address, mint, and send change to beneficiary:
        params.etherAddress.transfer(incomingEther);
        Controller controller = Controller(_avatar.owner());
        if (!controller.mintTokens(tokens, _beneficiary)) {
            revert();
        }
        if (change != 0) {
            _beneficiary.transfer(change);
        }

        // Update total raised, call event and return amount of tokens bought:
        org.totalEthRaised += incomingEther;
        DonationReceived(_avatar, _beneficiary, incomingEther, tokens);
        return tokens;
    }
}
