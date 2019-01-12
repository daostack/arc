pragma solidity ^0.5.2;

import "./UniversalScheme.sol";
import "../libs/SafeERC20.sol";

/**
 * @title A universal organization registry.
 * @dev Organizations can use this scheme to open a registry.
 * Other organizations can then add and promote themselves on this registry.
 */

contract OrganizationRegister is UniversalScheme {
    using SafeMath for uint;
    using SafeERC20 for address;

    struct Parameters {
        uint256 fee;
        IERC20 token;
        address beneficiary;
    }

    // A mapping from the organization (Avatar) address to the saved data of the organization:
    mapping(address=>mapping(address=>uint)) public organizationsRegistry;

    mapping(bytes32=>Parameters) public parameters;

    event OrgAdded( address indexed _registry, address indexed _org);
    event Promotion( address indexed _registry, address indexed _org, uint256 _amount);

    /**
    * @dev Hash the parameters, save if needed and return the hash value
    * @param _token -  the token to pay for register or promotion an address.
    * @param _fee  - fee needed for register an address.
    * @param _beneficiary  - the beneficiary payment address
    * @return bytes32 -the parameters hash
    */
    function setParameters(IERC20 _token, uint256 _fee, address _beneficiary) public returns(bytes32) {
        bytes32 paramsHash = getParametersHash(_token, _fee, _beneficiary);
        if (parameters[paramsHash].token == ERC20(0)) {
            parameters[paramsHash].token = _token;
            parameters[paramsHash].fee = _fee;
            parameters[paramsHash].beneficiary = _beneficiary;
        }
        return paramsHash;
    }

    /**
    * @dev Hash the parameters ,and return the hash value
    * @param _token -  the token to pay for register or promotion an address.
    * @param _fee  - fee needed for register an address.
    * @param _beneficiary  - the beneficiary payment address
    * @return bytes32 -the parameters hash
    */
    function getParametersHash(IERC20 _token, uint256 _fee, address _beneficiary)
    public pure returns(bytes32)
    {
        return (keccak256(abi.encodePacked(_token, _fee, _beneficiary)));
    }

    /**
     * @dev Adding or promoting an address on the registry.
     *      An address(record) to add or promote can be organization address or any contract address.
     *      Adding a record is done by paying at least the minimum required by the registry params.
     *      Promoting a record is done by paying(adding)amount of token to the registry beneficiary.
     * @param _avatar The _avatar of the organization which own the registry.
     * @param _record The address to add or promote.
     * @param _amount amount to pay for adding or promoting
     */
    function addOrPromoteAddress(Avatar _avatar, address _record, uint256 _amount)
    public
    {
        Parameters memory params = parameters[getParametersFromController(_avatar)];
        // Pay promotion, if the org was not listed the minimum is the fee:
        require((organizationsRegistry[address(_avatar)][_record] > 0) || (_amount >= params.fee));

        address(params.token).safeTransferFrom(msg.sender, params.beneficiary, _amount);
        if (organizationsRegistry[address(_avatar)][_record] == 0) {
            emit OrgAdded(address(_avatar), _record);
        }
        organizationsRegistry[address(_avatar)][_record] =
        organizationsRegistry[address(_avatar)][_record].add(_amount);
        emit Promotion(address(_avatar), _record, _amount);
    }
}
