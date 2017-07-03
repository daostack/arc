pragma solidity ^0.4.11;

import "../controller/Controller.sol";
import "./UniversalScheme.sol";

contract UniversalOrgRegistry is UniversalScheme {

    struct Organization {
        bool isRegistered;
        uint fee;
        StandardToken token;
        address beneficiary;
        mapping(address=>uint) registry;
    }

    mapping(address=>Organization) organizations;

    event OrgAdded( address indexed _registry, address indexed _org);
    event Promotion( address indexed _registry, address indexed _org, uint _amount);

    function UniversalOrgRegistry(StandardToken _nativeToken, uint _fee, address _beneficiary) {
      updateParameters(_nativeToken, _fee, _beneficiary, bytes32(0));
    }

    function parametersHash(StandardToken _token, uint _fee, address _beneficiary)
                              constant returns(bytes32) {
      return (sha3(_token, _fee, _beneficiary));
    }

    function checkParameterHashMatch(Controller _controller, StandardToken _token, uint _fee, address _beneficiary)
                              constant returns(bool) {
       return (_controller.getSchemeParameters(this) == parametersHash(_token, _fee, _beneficiary));
    }

    function addOrUpdateOrg(Controller _controller, StandardToken _token, uint _fee, address _beneficiary) {
        // Pay fees for using scheme:
        nativeToken.transferFrom(msg.sender, _beneficiary, _fee);

        require(checkParameterHashMatch(_controller, _token, _fee, _beneficiary));
        Organization memory org;
        org.isRegistered = true;
        org.token = _token;
        org.fee = _fee;
        org.beneficiary = _beneficiary;
        organizations[_controller] = org;
    }


    function addOrPromoteOrg(Controller _controller, address _record, uint _amount) {
        Organization org = organizations[_controller];
        require(org.isRegistered); // Check org is registred to use this universal scheme.
        // Pay promotion:
        if ((org.registry[_record] == 0) && (_amount < org.fee) ) revert();

        org.token.transferFrom(msg.sender, org.beneficiary, _amount);
        if (org.registry[_record] == 0) 
            OrgAdded(_controller, _record);
        org.registry[_record] += _amount;
        Promotion(_controller, _record, _amount);
    }
}
