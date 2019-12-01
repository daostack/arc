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
        address payable _contributionReward, //address of the contract to redeem from.
        uint256 snapshotBlock
    );

    event NewSuggestion(
        bytes32 indexed _proposalId,
        uint256 indexed _suggestionId,
        string indexed _descriptionHash,
        address suggester
    );

    event NewVote(
        bytes32 indexed _proposalId,
        uint256 indexed _suggestionId,
        address indexed _voter,
        uint256 reputation
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
    }

    // A struct holding the data for a competition proposal
    struct Proposal {
        CompetitionProposal competitionProposal;
        uint256 snapshotBlock;
        uint256 currentMinTopSuggestiosScore;
        uint256[MAX_NUMBER_OF_WINNERS] topSuggestionsOrdered;
    }

    struct Suggestion {
        uint256 totalVotes;
        bytes32 proposalId;
        address suggester;
        mapping(address=>uint256) votes;
    }

    //mapping from proposalID to Proposal
    mapping(bytes32=>Proposal) public proposals;

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

        uint256 totalRewardSplit;
        for (uint256 i = 0; i < _competitionProposal.numberOfWinners; i++) {
            totalRewardSplit = totalRewardSplit.add(_competitionProposal.rewardSplit[i]);
        }
        require(totalRewardSplit == 100, "total rewards split is not 100%");

        proposalId = ContributionRewardExt(_competitionProposal.contributionReward).proposeContributionReward(
                _descriptionHash,
                _contributionProposal.reputationChange,
                [_contributionProposal.nativeTokenReward,
                _contributionProposal.ethReward,
                _contributionProposal.externalTokenReward],
                _contributionProposal.externalToken,
                _competitionProposal.contributionReward,
                msg.sender);
        // solhint-disable-next-line not-rely-on-time
        proposals[proposalId].snapshotBlock = block.number + (_competitionProposal.votingStartTime.sub(now)).div(15);
        proposals[proposalId].competitionProposal = _competitionProposal;

        emit NewCompetitionProposal(
            proposalId,
            _competitionProposal.numberOfWinners,
            _competitionProposal.rewardSplit,
            _competitionProposal.startTime,
            _competitionProposal.votingStartTime,
            _competitionProposal.endTime,
            _competitionProposal.numberOfVotesPerVoters,
            _competitionProposal.contributionReward,
            proposals[proposalId].snapshotBlock
        );
    }

    function suggest(
            bytes32 _proposalId,
            string memory _descriptionHash
    )
    public
    returns(uint256)
    {
      // solhint-disable-next-line not-rely-on-time
        require(proposals[_proposalId].competitionProposal.startTime <= now, "competition not started yet");
        // solhint-disable-next-line not-rely-on-time
        require(proposals[_proposalId].competitionProposal.endTime > now, "competition ended");
        suggestionsCounter = suggestionsCounter.add(1);
        suggestions[suggestionsCounter].proposalId = _proposalId;
        suggestions[suggestionsCounter].suggester = msg.sender;
        emit NewSuggestion(_proposalId, suggestionsCounter, _descriptionHash, msg.sender);
        return suggestionsCounter;
    }

    function vote(uint256 _suggestionId)
    public
    returns(bool)
    {
        bytes32 proposalId = suggestions[_suggestionId].proposalId;
        require(proposalId != bytes32(0), "suggestion not exist");
        CompetitionProposal memory competitionProposal = proposals[proposalId].competitionProposal;
        // solhint-disable-next-line not-rely-on-time
        require(competitionProposal.votingStartTime > now, "votingh period not started yet");
        // solhint-disable-next-line not-rely-on-time
        require(competitionProposal.endTime < now, "competition ended");
        Suggestion storage suggestion = suggestions[_suggestionId];
        require(suggestion.votes[msg.sender] == 0, "already voted on this suggestion");
        require(suggestion.votes[msg.sender] < competitionProposal.numberOfVotesPerVoters,
        "exceed number of votes allowed");

        suggestion.votes[msg.sender] = suggestion.votes[msg.sender].add(1);
        Avatar avatar = ContributionRewardExt(competitionProposal.contributionReward).avatar();
        uint256 reputation = avatar.nativeReputation().balanceOfAt(msg.sender, proposals[proposalId].snapshotBlock);
        suggestion.totalVotes = suggestion.totalVotes.add(reputation);
        suggestion.votes[msg.sender] = reputation;

        if (suggestions[_suggestionId].totalVotes >
            suggestions[proposals[proposalId].
            topSuggestionsOrdered[competitionProposal.numberOfWinners - 1]].totalVotes) {
            refreshTopXOrdered(proposalId, _suggestionId);
        }

        emit NewVote(proposalId, _suggestionId, msg.sender, reputation);
        return true;
    }

    function redeem(uint256 _suggestionId, address payable _beneficiary) public {
        bytes32 proposalId = suggestions[_suggestionId].proposalId;
        require(proposalId != bytes32(0), "suggestion not exist");
        CompetitionProposal memory competitionProposal = proposals[proposalId].competitionProposal;
        // solhint-disable-next-line not-rely-on-time
        require(competitionProposal.endTime > now, "competition is still on");
        uint256 amount;
        //check if there is a win
        for (uint256 i = 0; i < competitionProposal.numberOfWinners; i++) {
            if (suggestions[proposals[proposalId].topSuggestionsOrdered[i]].suggester == _beneficiary) {
                require(proposals[proposalId].topSuggestionsOrdered[i] == _suggestionId, "wrong suggestionId");
                suggestions[_suggestionId].suggester = address(0);
                amount = ContributionRewardExt(competitionProposal.contributionReward)
                .getProposalExternalTokenReward(proposalId).mul(competitionProposal.rewardSplit[i]).div(100);
                ContributionRewardExt(competitionProposal.contributionReward).redeemExternalTokenFromExtContract(
                proposalId,
                _beneficiary,
                amount);

                amount = uint256(ContributionRewardExt(competitionProposal.contributionReward)
                .getProposalReputationReward(proposalId)).mul(competitionProposal.rewardSplit[i]).div(100);
                ContributionRewardExt(competitionProposal.contributionReward).redeemReputationFromExtContract(
                proposalId,
                _beneficiary,
                amount);

                amount = ContributionRewardExt(competitionProposal.contributionReward)
                .getProposalEthReward(proposalId).mul(competitionProposal.rewardSplit[i]).div(100);
                ContributionRewardExt(competitionProposal.contributionReward).redeemEtherFromExtContract(
                proposalId,
                _beneficiary,
                amount);

                amount = ContributionRewardExt(competitionProposal.contributionReward)
                .getProposalNativeTokenReward(proposalId).mul(competitionProposal.rewardSplit[i]).div(100);
                ContributionRewardExt(competitionProposal.contributionReward).redeemNativeTokenFromExtContract(
                proposalId,
                _beneficiary,
                amount);
                break;
            }
        }
    }

    function refreshTopXOrdered(bytes32 _proposalId, uint256 _suggestionId) internal {
        uint256[MAX_NUMBER_OF_WINNERS] storage topSuggestionsOrdered = proposals[_proposalId].topSuggestionsOrdered;
        uint i = 0;
        /** get the index of the current max element **/
        for (i; i < proposals[_proposalId].competitionProposal.numberOfWinners; i++) {
            if (suggestions[topSuggestionsOrdered[i]].totalVotes <
                    suggestions[_suggestionId].totalVotes) {
                break;
            }
        }
          /** shift the array of one position (getting rid of the last element) **/
        for (uint j = proposals[_proposalId].competitionProposal.numberOfWinners - 1; j > i; j--) {
            topSuggestionsOrdered[j] = topSuggestionsOrdered[j - 1];
        }
          /** update the new max element **/
        topSuggestionsOrdered[i] = _suggestionId;
    }
}
