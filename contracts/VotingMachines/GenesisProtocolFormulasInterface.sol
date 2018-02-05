pragma solidity ^0.4.19;


interface GenesisProtocolFormulasInterface {

    function shouldBoost(bytes32 _proposalId) public view returns (bool);

    function score(bytes32 _proposalId) public view returns (int);

    function threshold(address _avatar) public view returns (int);

    function redeemAmount(bytes32 _proposalId,address _staker) public view returns (uint);

    /**
     * @dev redeemProposerRepAmount return the redeem amount which a proposer is entitle to.
     * @param _proposalId the ID of the proposal
     * @return int proposer redeem reputation amount.
     */
    function redeemProposerReputation(bytes32 _proposalId) public view returns(int);

    /**
     * @dev redeemVoterAmount return the redeem amount which a voter is entitle to.
     * @param _proposalId the ID of the proposal
     * @param _beneficiary the beneficiary .
     * @return uint redeem amount for a voter.
     */
    function redeemVoterAmount(bytes32 _proposalId, address _beneficiary) public view returns(uint);

}
