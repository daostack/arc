pragma solidity ^0.4.18;

import "../controller/Avatar.sol";
import "../controller/Controller.sol";
import "../controller/DAOToken.sol";
import "../controller/Reputation.sol";

/**
 * @title Genesis Scheme that creates organizations
 */

contract GenesisScheme {
    DAOToken nativeToken;
    Reputation nativeReputation;
    Avatar avatar;

    mapping(address=>address) locks;

    event NewOrg (address _avatar);
    event InitialSchemesSet (address _avatar);

    address[] addressArray;
    bytes32[] bytes32Array;
    bytes4[] bytes4Array;

    function GenesisScheme() public {
      addressArray.push(address(this));
      bytes32Array.push(bytes32(0));
      bytes4Array.push(bytes4(0xF));
    }

    /**
     * @dev Create a new organization
     * @param _orgName The name of the new organization
     * @param _tokenName The name of the token associated with the organization
     * @param _tokenSymbol The symbol of the token
     * @param _founders An array with the addresses of the founders of the organization
     * @param _foundersTokenAmount An array of amount of tokens that the founders
     *  receive in the new organization
     * @param _foundersReputationAmount An array of amount of reputation that the
     *   founders receive in the new organization
     *
     * @return The address of the avatar of the controller
     */
    function forgeOrg (
      bytes32 _orgName,
      string _tokenName,
      string _tokenSymbol,
      address[] _founders,
      uint[] _foundersTokenAmount,
      int[] _foundersReputationAmount
    ) public returns(address)
    {
      // Create Token, Reputation and Avatar:
      nativeToken = new DAOToken(_tokenName, _tokenSymbol);
      nativeReputation = new Reputation();
      avatar =  new Avatar(_orgName, nativeToken, nativeReputation);

      // Create Controller:
      Controller controller = new Controller(avatar, nativeToken, nativeReputation, addressArray, bytes32Array, bytes4Array);
      // Transfer ownership:
      avatar.transferOwnership(controller);
      nativeToken.transferOwnership(controller);
      nativeReputation.transferOwnership(controller);

      // Mint token and reputation for founders:
      for( uint i = 0 ; i < _founders.length ; i++ ) {
        if(!controller.mintTokens(_foundersTokenAmount[i], _founders[i])) {
          revert();
        }
        if(!controller.mintReputation(_foundersReputationAmount[i], _founders[i])) {
          revert();
        }
      }

      locks[avatar] = msg.sender;

      NewOrg (address(avatar));
      return (address(avatar));
    }

    /**
     * @dev  register some initial schemes
     */
    function setInitialSchemes (
      Avatar _avatar,
      address[] _schemes,
      bytes32[] _params,
      StandardToken[] _token,
      uint[] _fee,
      bytes4[] _permissions
    )
      public
    {
      // this action can only be executed by the account that holds the lock
      // for this controller
      require(locks[address(_avatar)] == msg.sender);

      // register initial schemes:
      Controller controller = Controller(_avatar.owner());
      for( uint i = 0 ; i < _schemes.length ; i++ ) {
        // TODO: the approval here is for paying the fee for that scheme later (with registerOrganization())
        // TODO: (continued)  why not have that separate? And why not ask the scheme for its fee, then, instead of passing it here?
        controller.externalTokenApprove(_token[i], _schemes[i], _fee[i]);
        controller.registerScheme(_schemes[i], _params[i], _permissions[i]);
      }

      // Unregister self:
      controller.unregisterScheme(this);

      // Remove lock:
      delete locks[_avatar];

      InitialSchemesSet(address(avatar));
    }
}
