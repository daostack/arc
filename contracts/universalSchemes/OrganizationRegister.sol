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
    mapping(address=>mapping(address=>uint)) organizationsRegistery;

    mapping(bytes32=>Parameters) parameters;

    event OrgAdded( address indexed _registry, address indexed _org);
    event Promotion( address indexed _registry, address indexed _org, uint _amount);

    // Constructor, updating the initial prarmeters:
    function OrganizationRegister(StandardToken _nativeToken, uint _fee, address _beneficiary) public {
        updateParameters(_nativeToken, _fee, _beneficiary, bytes32(0));
    }

    /**
    * @dev hash the parameters, save them if necessary, and return the hash value
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

    // The format of the hashing of the parameters:
    function getParametersHash(StandardToken _token, uint _fee, address _beneficiary)
    public pure returns(bytes32)
    {
        return (keccak256(_token, _fee, _beneficiary));
    }

    // Adding or promoting an organization on the registry.
    function addOrPromoteOrg(Avatar _avatar, address _record, uint _amount)
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
