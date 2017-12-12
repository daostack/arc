pragma solidity ^0.4.18;


import "../VotingMachines/IntVoteInterface.sol";


// mock voting machine
contract IntVoteMock is IntVoteInterface {

    struct Proposal {
        address avatar; // the avatar of the organization that owns the proposal
        uint numOfChoices;
        ExecutableInterface executable; // will be executed if the proposal will pass
        bytes32 paramsHash; // the hash of the parameters of the proposal
    }

    uint proposalsCnt;
    mapping(bytes32=>Proposal) public proposals;

    function propose(
        uint _numOfChoices,
        bytes32 _proposalParameters,
        address _avatar,
        ExecutableInterface _executable
    ) public returns(bytes32)
    {
        bytes32 proposalId = keccak256(this, proposalsCnt);
        proposals[proposalId] = Proposal({
            avatar: _avatar,
            numOfChoices: _numOfChoices,
            executable: _executable,
            paramsHash: _proposalParameters
        });
        return proposalId;
    }

    function callExecute(bytes32 _proposalId, int _param) public {
        proposals[_proposalId].executable.execute(_proposalId, proposals[_proposalId].avatar, _param);
    }

}
