pragma solidity ^0.4.24;

import "./Avatar.sol";
import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";


/**
 * @title Controller contract
 * @dev A controller controls the organizations tokens ,reputation and avatar.
 * It is subject to a set of schemes and constraints that determine its behavior.
 * Each scheme has defined operation permissions.
 */
interface ControllerInterface {

    /**
     * @dev Mint `_amount` of reputation that are assigned to `_to` .
     * @param  _amount amount of reputation to mint
     * @param _to beneficiary address
     * @return bool which represents a success
     */
    function mintReputation(uint256 _amount, address _to) external returns(bool);

    /**
     * @dev Burns `_amount` of reputation from `_from`
     * @param _amount amount of reputation to burn
     * @param _from The address that will lose the reputation
     * @return bool which represents a success
     */
    function burnReputation(uint256 _amount, address _from) external returns(bool);

    /**
     * @dev mint tokens .
     * @param  _amount amount of token to mint
     * @param _beneficiary beneficiary address
     * @return bool which represents a success
     */
    function mintTokens(uint256 _amount, address _beneficiary) external returns(bool);

   /**
    * @dev register or update a scheme
    * @param _scheme the address of the scheme
    * @param _permissions the permissions the new scheme will have
    * @return bool which represents a success
    */
    function registerScheme(address _scheme, bytes4 _permissions) external returns(bool);

    /**
     * @dev unregister a scheme
     * @param _scheme the address of the scheme
     * @return bool which represents a success
     */
    function unregisterScheme(address _scheme) external returns(bool);

    /**
     * @dev unregister the caller's scheme
     * @return bool which represents a success
     */
    function unregisterSelf() external returns(bool);

    function isSchemeRegistered( address _scheme) external view returns(bool);

    function getSchemePermissions(address _scheme) external view returns(bytes4);

    /**
     * @dev constraintsCount return the constraints pre and post count
     * @return uint constraints count.
     */
    function constraintsCount() external view returns(uint);

    function isConstraintRegistered(address _constraint) external view returns(bool);

    /**
     * @dev add constraint
     * @param _constraint the address of the constraint to be added.
     * @return bool which represents a success
     */
    function addConstraint(address _constraint) external returns(bool);

    /**
     * @dev remove constraint
     * @param _constraint the address of the constraint to be remove.
     * @return bool which represents a success
     */
    function removeConstraint (address _constraint) external returns(bool);

    /**
     * @dev upgrade the Controller
     *      The function will trigger an event 'UpgradeController'.
     * @param  _newController the address of the new controller.
     * @return bool which represents a success
     */
    function upgradeController(address _newController) external returns(bool);

    /**
     * @dev perform a generic call to an arbitrary contract
     * @param _contract  the contract's address to call
     * @param _data ABI-encoded contract call to call `_contract` address.
     * @return bytes32  - the return value of the called _contract's function.
     */
    function genericCall(address _contract, bytes _data) external returns(bytes32);

    /**
     * @dev send some ether
     * @param _amountInWei the amount of ether (in Wei) to send
     * @param _to address of the beneficiary
     * @return bool which represents a success
     */
    function sendEther(uint _amountInWei, address _to) external returns(bool);

    /**
     * @dev send some amount of arbitrary ERC20 Tokens
     * @param _externalToken the address of the Token Contract
     * @param _to address of the beneficiary
     * @param _value the amount of ether (in Wei) to send
     * @return bool which represents a success
     */
    function externalTokenTransfer(StandardToken _externalToken, address _to, uint _value) external returns(bool);

    /**
     * @dev transfer token "from" address "to" address
     *      One must to approve the amount of tokens which can be spend from the
     *      "from" account.This can be done using externalTokenApprove.
     * @param _externalToken the address of the Token Contract
     * @param _from address of the account to send from
     * @param _to address of the beneficiary
     * @param _value the amount of ether (in Wei) to send
     * @return bool which represents a success
     */
    function externalTokenTransferFrom(StandardToken _externalToken, address _from, address _to, uint _value) external returns(bool);

    /**
     * @dev increase approval for the spender address to spend a specified amount of tokens
     *      on behalf of msg.sender.
     * @param _externalToken the address of the Token Contract
     * @param _spender address
     * @param _addedValue the amount of ether (in Wei) which the approval is referring to.
     * @return bool which represents a success
     */
    function externalTokenIncreaseApproval(StandardToken _externalToken, address _spender, uint _addedValue) external returns(bool);

    /**
     * @dev decrease approval for the spender address to spend a specified amount of tokens
     *      on behalf of msg.sender.
     * @param _externalToken the address of the Token Contract
     * @param _spender address
     * @param _subtractedValue the amount of ether (in Wei) which the approval is referring to.
     * @return bool which represents a success
     */
    function externalTokenDecreaseApproval(StandardToken _externalToken, address _spender, uint _subtractedValue) external returns(bool);

    /**
     * @dev getNativeReputation
     * @return organization native reputation
     */
    function getNativeReputation() external view returns(address);
}
