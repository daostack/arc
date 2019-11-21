pragma solidity 0.5.13;

/**
 * @title A scheme for conduct ERC20 Tokens auction for reputation
 */


contract Agreement {

    bytes32 private agreementHash;

    modifier onlyAgree(bytes32 _agreementHash) {
        require(_agreementHash == agreementHash, "Sender must send the right agreementHash");
        _;
    }

    /**
     * @dev getAgreementHash
     * @return bytes32 agreementHash
     */
    function getAgreementHash() external  view returns(bytes32)
    {
        return agreementHash;
    }

    /**
     * @dev setAgreementHash
     * @param _agreementHash is a hash of agreement required to be added to the TX by participants
     */
    function setAgreementHash(bytes32 _agreementHash) internal
    {
        require(agreementHash == bytes32(0), "Can not set agreement twice");
        agreementHash = _agreementHash;
    }


}
