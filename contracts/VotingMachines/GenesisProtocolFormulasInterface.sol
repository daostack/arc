pragma solidity ^0.4.19;


interface GenesisProtocolFormulasInterface {

    function shouldBoost(bytes32 _proposalId) public view returns (bool);

    function score(bytes32 _proposalId) public view returns (int);

    function threshold(bytes32 _proposalId,address _avatar) public view returns (int);

    function getRedeemableTokensStaker(bytes32 _proposalId,address _staker) public view returns (uint);

    /**
     * @dev getRedeemableReputationProposer return the redeemable reputation which a proposer is entitle to.
     * @param _proposalId the ID of the proposal
     * @return int proposer redeem reputation amount.
     */
    function getRedeemableReputationProposer(bytes32 _proposalId) public view returns(int);

    /**
     * @dev getRedeemableTokensVoter return the redeemable amount which a voter is entitle to.
     * @param _proposalId the ID of the proposal
     * @param _beneficiary the beneficiary .
     * @return uint redeem amount for a voter.
     */
    function getRedeemableTokensVoter(bytes32 _proposalId, address _beneficiary) public view returns(uint);

}
