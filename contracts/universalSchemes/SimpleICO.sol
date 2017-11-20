pragma solidity ^0.4.18;

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

  /**
   * @dev Constructor, setting the organization and ICO scheme.
   * @param _organization The organization's avatar.
   * @param _simpleICO The ICO Scheme.
   */
  function MirrorContractICO(Avatar _organization, SimpleICO _simpleICO) public {
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

    // Return ether if couln't donate.
    if (simpleICO.donate.value(msg.value)(organization, msg.sender) == 0) {
      revert();
    }
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
    struct Parameters {
      uint cap; // Cap in Eth
      uint price; // Price represents Tokens per 1 Eth
      uint startBlock;
      uint endBlock;
      address beneficiary; // all funds received will be transffered to this address.
      address admin; // The admin can halt or resume ICO.
    }

    // A mapping from the organization (Avatar) address to the saved data of the organization:
    mapping(address=>Organization) public organizations;

    mapping(bytes32=>Parameters) parameters;

    event DonationReceived(address indexed organization, address indexed _beneficiary, uint _incomingEther, uint indexed _tokensAmount);

    /**
     * @dev Constructor, Updating the initial prarmeters
     * @param _nativeToken The native token of the ICO
     * @param _fee The fee for intiating the ICO
     * @param _beneficiary The address that will receive the ethers
     */
    function SimpleICO(StandardToken _nativeToken, uint _fee, address _beneficiary) public {
      updateParameters(_nativeToken, _fee, _beneficiary, bytes32(0));
    }

    /**
     * @dev Hash the parameters, save them if necessary, and return the hash value
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
      bytes32 paramsHash = getParametersHash(_cap, _price, _startBlock, _endBlock, _beneficiary, _admin);
      if (parameters[paramsHash].cap != 0) {
        parameters[paramsHash].cap = _cap;
        parameters[paramsHash].price = _price;
        parameters[paramsHash].startBlock = _startBlock;
        parameters[paramsHash].endBlock = _endBlock;
        parameters[paramsHash].beneficiary = _beneficiary;
        parameters[paramsHash].admin = _admin;
      }
      return paramsHash;
    }


    /**
     * @dev Calculate a hash of the given parameters.
     * @return bytes32 Hash of the given parameters.
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
      return (keccak256(_cap, _price, _startBlock, _endBlock, _beneficiary, _admin));
    }

    /**
     * @dev Adding an organization to the universal scheme, and opens an ICO for it
     * @param _avatar The Avatar's of the organization
     */
    function registerOrganization(Avatar _avatar) public {
      // Pay fees for using scheme:
      if ((fee > 0) && (! organizations[_avatar].isRegistered)) {
        nativeToken.transferFrom(_avatar, beneficiary, fee);
      }

      // Check there is no ongoing ICO:
      require(!isActiveICO(_avatar));

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
    function () public {
      revert();
    }

    /**
     * @dev Allowing admin to halt an ICO.
     * @param _avatar The Avatar's of the organization
     */
    function haltICO(address _avatar) public {
      require(msg.sender == parameters[organizations[_avatar].paramsHash].admin);
      organizations[_avatar].isHalted = true;
    }

    /**
     * @dev Allowing admin to reopen an ICO.
     * @param _avatar The Avatar's of the organization
     */
    function resumeICO(address _avatar) public {
      require(msg.sender == parameters[organizations[_avatar].paramsHash].admin);
      organizations[_avatar].isHalted = false;
    }

    /**
     * @dev Check is an ICO is active (halted is still considered active). Active ICO:
     * 1. The organization is registered.
     * 2. The ICO didn't reach it's cap yet.
     * 3. The current block isn't bigger than the "endBlock" & Smaller then the "startBlock"
     * @param _avatar The Avatar's of the organization
     * @return bool which represents a successful of the function
     */
    function isActiveICO(address _avatar) public constant returns(bool) {
      Organization memory org = organizations[_avatar];
      Parameters memory params = parameters[org.paramsHash];
      if (! org.isRegistered) {
        return false;
      }
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
     * @return bool which represents a successful of the function
     */
    function donate(Avatar _avatar, address _beneficiary) public payable returns(uint) {
      Organization memory org = organizations[_avatar];
      Parameters memory params = parameters[org.paramsHash];

      // Check ICO is active:
      require(isActiveICO(_avatar));

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

      // Send ether to the defined address, mint, and send change to beneficiary:
      params.beneficiary.transfer(incomingEther);
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
