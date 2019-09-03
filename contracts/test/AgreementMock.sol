pragma solidity ^0.5.11;

import "../schemes/Agreement.sol";


contract AgreementMock is Agreement {

    function setAgreementHashTest(bytes32 _agreementHash) public
    {
        super.setAgreementHash(_agreementHash);
    }

    function test(bytes32 _agreementHash) public onlyAgree(_agreementHash) view returns(bool)
    {
        return true;
    }
}
