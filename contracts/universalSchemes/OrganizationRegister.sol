pragma solidity ^0.4.18;

import "./UniversalScheme.sol";

/**
 * @title A universal organization registry.
 * @dev Organizations can use this scheme to open a registry.
 * Other organizations can then add and promote themselves on this registry.
 */


contract OrganizationRegister is UniversalScheme {

    struct Parameters {
        uint fee;
        StandardToken token;
        address beneficiary;
    }

    // A mapping from thr organization (Avatar) address to the saved data of the organization:
    mapping(address=>mapping(address=>uint)) public organizationsRegistery;

    mapping(bytes32=>Parameters) public parameters;

    event OrgAdded( address indexed _registry, address indexed _org);
    event Promotion( address indexed _registry, address indexed _org, uint _amount);

    /**
     * @dev Constructor, Updating the initial prarmeters
     * @param _nativeToken The native token of the ICO
     * @param _fee The fee for intiating the ICO
     * @param _beneficiary The address that will receive the ethers
     */
    function OrganizationRegister(StandardToken _nativeToken, uint _fee, address _beneficiary) public {
        updateParameters(_nativeToken, _fee, _beneficiary, bytes32(0));
    }

    /**
    * @dev Hash the parameters,save if needed and return the hash value
    * @param _token -  the token to pay for register or promotion an address.
    * @param _fee  - fee needed for register an address.
    * @param _beneficiary  - the beneficiary payment address
    * @return bytes32 -the parameters hash
    */
    function setParameters(StandardToken _token, uint _fee, address _beneficiary) public returns(bytes32) {
        bytes32 paramsHash = getParametersHash(_token, _fee, _beneficiary);
        if (parameters[paramsHash].token == address(0)) {
            parameters[paramsHash].token = _token;
            parameters[paramsHash].fee = _fee;
            parameters[paramsHash].beneficiary = _beneficiary;
        }
        return paramsHash;
    }

    /**
    * @dev Hash the parameters,and return the hash value
    * @param _token -  the token to pay for register or promotion an address.
    * @param _fee  - fee needed for register an address.
    * @param _beneficiary  - the beneficiary payment address
    * @return bytes32 -the parameters hash
    */
    function getParametersHash(StandardToken _token, uint _fee, address _beneficiary)
    public pure returns(bytes32)
    {
        return (keccak256(_token, _fee, _beneficiary));
    }

    /**
     * @dev Adding or promoting an address on the registry.
     *      An address(record) to add or promote can be organization address or any contract address.
     *      Adding a record is done by paying at least the minimum required by the registery params.
     *      Promoting a record is done by paying(adding)amount of token to the registery beneficiary.
     * @param _avatar The _avatar of the organization which own the registery.
     * @param _record The address to add or promote.
     * @param _amount amount to pay for adding or promoting
     */
    function addOrPromoteAddress(Avatar _avatar, address _record, uint _amount)
    onlyRegisteredOrganization(_avatar)
    public
    {
        Parameters memory params = parameters[getParametersFromController(_avatar)];
        // Pay promotion, if the org was not listed the minimum is the fee:
        if ((organizationsRegistery[_avatar][_record] == 0) && (_amount < params.fee) ) {
            revert();
        }

        params.token.transferFrom(msg.sender, params.beneficiary, _amount);
        if (organizationsRegistery[_avatar][_record] == 0)
          OrgAdded(_avatar, _record);
        organizationsRegistery[_avatar][_record] += _amount;
        Promotion(_avatar, _record, _amount);
    }
}
