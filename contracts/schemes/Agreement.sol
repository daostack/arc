pragma solidity ^0.5.11;

/**
 * @title A scheme for conduct ERC20 Tokens auction for reputation
 */

 /** JG: why is this called an agreement. it is missing all the elements of what
you'd usually call an agreement, like the parties and the thing agreed upon...
*/

contract Agreement {

    bytes32 private agreementHash;

    modifier onlyAgree(bytes32 _agreementHash) {
        // this error message implies very strongly  aparticular usage of this contract... what is it?
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
