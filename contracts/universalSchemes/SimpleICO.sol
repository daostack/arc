pragma solidity ^0.4.11;

import "../controller/Controller.sol";
import "./UniversalScheme.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/SafeMath.sol";
import "zeppelin-solidity/contracts/lifecycle/Destructible.sol";


/**
 * @title An avatar contract for ICO.
 * @dev Allow people to donate by simply sending ether to an address.
 */
contract AvatarContractICO is Destructible {
  Controller public organization; // The organization address (currently controller)
  SimpleICO public simpleICO;  // The ICO contract address

  // Contstructor, setting the organization and ICO scheme:
  function AvatarContractICO(Controller _organization, SimpleICO _simpleICO) {
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
      uint cap; // Cap in Eth
      uint price; // Price represents Tokens per 1 Eth
      uint startBlock;
      uint endBlock;
      address etherAddress; // all funds received will be transffered to this address.
      address admin; // The admin can halt or resume ICO.
      address avatarContractICO; // Avatar is a contract for users that want to send eth without calling a funciton.
      uint totalEthRaised;
      bool isOpen;
      bool isRegistered;
    }

    // A mapping from thr organization (controller) address to the saved data of the organization:
    mapping(address=>Organization) public organizations;

    event DonationRecieved( address indexed organization, address indexed _beneficiary, uint _incomingEther  ,uint indexed _tokensAmount );

    // Constructor, updating the initial prarmeters:
    function SimpleICO(StandardToken _nativeToken, uint _fee, address _beneficiary) {
        updateParameters(_nativeToken, _fee, _beneficiary, bytes32(0));
    }

    // The format of the hashing of the parameters:
    function parametersHash(uint _cap, uint _price, uint _startBlock, uint _endBlock,
                            address _etherAddress, address _admin) constant returns(bytes32) {
        return (sha3(_cap, _price, _startBlock, _endBlock, _etherAddress, _admin));
    }

    // Check that the parameters listed match the ones in the controller:
    function checkParameterHashMatch(Controller _controller, uint _cap, uint _price, uint _startBlock,
                            uint _endBlock, address _etherAddress, address _admin) constant returns(bool) {
       return (_controller.getSchemeParameters(this) == parametersHash(_cap, _price, _startBlock, _endBlock, _etherAddress, _admin));
    }

    // Adding an organization to the universal scheme, and opens an ICO for it:
    function addOrgOpenICO(Controller _controller, uint _cap, uint _price, uint _startBlock,
                            uint _endBlock, address _etherAddress, address _admin) {

      // Pay fees for using scheme:
      nativeToken.transferFrom(msg.sender, beneficiary, fee);

      require(_controller.isSchemeRegistered(this) == true);
      require(checkParameterHashMatch(_controller, _cap, _price, _startBlock, _endBlock,
                                          _etherAddress, _admin));

      // Set the organization data:
      Organization memory org;
      org.isRegistered = true;
      org.cap = _cap;
      org.price = _price;
      org.startBlock = _startBlock;
      org.endBlock = _endBlock;
      org.etherAddress = _etherAddress;
      org.admin = _admin;
      org.avatarContractICO = new AvatarContractICO(_controller, this);
      org.isOpen = true;
      organizations[_controller] = org;
    }

    // If someone accidentally send ether to the contract, revert;
    function () {
        revert();
    }

    // Admin can halt ICO:
    function haltICO(address _controller) {
        require(msg.sender == organizations[_controller].admin);
        organizations[_controller].isOpen = false;
    }

    // Admin can reopen ICO:
    function resumeICO(address _controller) {
        require(msg.sender == organizations[_controller].admin);
        organizations[_controller].isOpen = true;
    }

    // Donating ethers to get tokens:
    function donate(Controller _controller, address _beneficiary) payable returns(uint) {
        Organization org = organizations[_controller];

        // Check PCO is open:
        require(org.isOpen);
        // Check cap reached:
        require(org.totalEthRaised < org.cap);
        // Check time cap:
        require(block.number <= org.endBlock);

        uint incomingEther;
        uint change;

        // Compute how much tokens to buy:
        if ( msg.value > (org.cap).sub(org.totalEthRaised) ) {
            incomingEther = (org.cap).sub(org.totalEthRaised);
            change = (msg.value).sub(incomingEther);
        } else {
            incomingEther = msg.value;
        }
        uint tokens = incomingEther.mul(org.price);

        // Send ether to the defined address, mint, and send change to beneficiary:
        org.etherAddress.transfer(incomingEther);
        if(! _controller.mintTokens(tokens, msg.sender)) revert();
        if (change != 0)
            _beneficiary.transfer(change);

        // Update total raised, call event and return amount of tokens bought:
        org.totalEthRaised += incomingEther;
        DonationRecieved(_controller, _beneficiary, incomingEther, tokens);
        return tokens;
    }
}
