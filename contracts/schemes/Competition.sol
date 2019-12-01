pragma solidity 0.5.13;
pragma experimental ABIEncoderV2;

import "./ContributionRewardExt.sol";

contract Competition {
    using SafeMath for uint256;

    uint256 constant public MAX_NUMBER_OF_WINNERS = 100;

    event NewCompetitionProposal(
        bytes32 indexed _proposalId,
        uint256 _numberOfWinners,
        uint256[MAX_NUMBER_OF_WINNERS] _rewardSplit,
        uint256 _startTime,
        uint256 _votingStartTime,
        uint256 _endTime,
        uint256 _numberOfVotesPerVoters,
        address payable _contributionReward //address of the contract to redeem from.
    );

    event NewSuggestion(
        bytes32 indexed _proposalId,
        uint256 indexed _suggestionId,
        string indexed _descriptionHash
    );

    // A struct holding the data for a competition proposal
    struct CompetitionProposal {
        uint256 numberOfWinners;
        uint256[MAX_NUMBER_OF_WINNERS] rewardSplit;
        uint256 startTime;
        uint256 votingStartTime;
        uint256 endTime;
        uint256 numberOfVotesPerVoters;
        address payable contributionReward; //address of the contract to redeem from.
        //suggestionsHeap
    }

    struct Suggestion {
        uint256 totalVotes;
        bytes32 proposalId;
    }

    //mapping from proposalID to CompetitionProposal
    mapping(bytes32=>CompetitionProposal) public competitionProposals;

    //mapping from suggestionId to Suggestion
    mapping(uint256=>Suggestion) public suggestions;

    mapping(address=>uint256) public votesPerVoter;

    uint256 public suggestionsCounter;

    function proposeCompetition(
            string memory _descriptionHash,
            ContributionRewardExt.ContributionProposal memory _contributionProposal,
            CompetitionProposal memory _competitionProposal
    )
    public
    returns(bytes32 proposalId)
    {
        require(_competitionProposal.numberOfWinners <= MAX_NUMBER_OF_WINNERS,
        "number of winners greater than max allowed");
        require(_competitionProposal.votingStartTime < _competitionProposal.endTime,
        "voting start time greater than end time");
        require(_competitionProposal.votingStartTime >= _competitionProposal.startTime,
        "voting start time smaller than start time");
        require(_competitionProposal.startTime < _competitionProposal.endTime,
        "start time greater than end time");
        require(_competitionProposal.numberOfVotesPerVoters > 0,
        "numberOfVotesPerVoters should be greater than 0");
        proposalId = ContributionRewardExt(_competitionProposal.contributionReward).proposeContributionReward(
                _descriptionHash,
                _contributionProposal.reputationChange,
                [_contributionProposal.nativeTokenReward,
                _contributionProposal.ethReward,
                _contributionProposal.externalTokenReward],
                _contributionProposal.externalToken,
                _competitionProposal.contributionReward,
                msg.sender);
        competitionProposals[proposalId] = _competitionProposal;

        emit NewCompetitionProposal(
            proposalId,
            _competitionProposal.numberOfWinners,
            _competitionProposal.rewardSplit,
            _competitionProposal.startTime,
            _competitionProposal.votingStartTime,
            _reputationChange.endTime,
            _reputationChange.contributionReward
        );
    }

    function suggest(
            bytes32 _proposalId,
            string memory _descriptionHash
    )
    public
    returns(uint256)
    {
        require(competitionProposals[_proposalId].startTime <= now, "competition not started yet");
        require(competitionProposals[_proposalId].endTime > now, "competition ended");
        suggestionId = suggestionId.add(1);
        suggestion[suggestionId].proposalId = _proposalId;
        emit NewSuggestion(_proposalId, suggestionId, _descriptionHash);
        return suggestionId;
    }

    function vote(uint256 _suggestionId)
    public
    returns(bytes32)
    {
        require(competitionProposals[_proposalId].votingStartTime > now, "votingh period not started yet");
        require(competitionProposals[_proposalId].endTime < now, "competition ended");
        bytes32 proposalId = suggestions[_suggestionId]._proposalId;
        require(proposalId != bytes32(0), "suggestion not exist");
        require(votes[msg.sender] < competitionProposals[proposalId].numberOfVotesPerVoters,
        "exceed number of votes allowd");
        votes[msg.sender] = votes[msg.sender].add(1);
        
        suggestionId = suggestionId.add(1);
        emit Suggestion(_proposalId, suggestionId, _descriptionHash);
        return suggestionId;
    }


}
