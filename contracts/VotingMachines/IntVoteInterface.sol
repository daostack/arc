pragma solidity ^0.4.18;

import "../universalSchemes/ExecutableInterface.sol";


contract IntVoteInterface {
    modifier onlyProposalOwner(bytes32 _proposalId) {_;}
    modifier votable(bytes32 _proposalId) {_;}

    function propose(
        uint _numOfChoices,
        bytes32 _proposalParameters,
        address _avatar,
        ExecutableInterface _executable
        ) public returns(bytes32);

    // Only owned proposals and only the owner:
    function cancelProposal(bytes32 _proposalId) public onlyProposalOwner(_proposalId) votable(_proposalId) returns(bool);

    // Only owned proposals and only the owner:
    function ownerVote(bytes32 _proposalId, uint _vote, address _voter) public onlyProposalOwner(_proposalId) returns(bool);

    function vote(bytes32 _proposalId, uint _vote) public votable(_proposalId) returns(bool);

    function voteWithSpecifiedAmounts(
        bytes32 _proposalId,
        uint _vote,
        uint _rep,
        uint _token) public votable(_proposalId) returns(bool);

    function cancelVote(bytes32 _proposalId) public votable(_proposalId);

    //@dev execute check if the proposal has been decided, and if so, execute the proposal
    //@param _proposalId the id of the proposal
    //@return bool true - the proposal has been executed
    //             false - otherwise.
    function execute(bytes32 _proposalId) public votable(_proposalId) returns(bool);

    function getNumberOfChoices(bytes32 _proposalId) public constant returns(uint);

    function isVotable(bytes32 _proposalId) public constant returns(bool);
}
