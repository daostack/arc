pragma solidity 0.5.13;

import "./ContributionRewardExt.sol";


contract Competition {
    using SafeMath for uint256;

    uint256 constant public MAX_NUMBER_OF_WINNERS = 100;

    event NewCompetitionProposal(
        bytes32 indexed _proposalId,
        uint256 _numberOfWinners,
        uint256[] _rewardSplit,
        uint256 _startTime,
        uint256 _votingStartTime,
        uint256 _endTime,
        uint256 _numberOfVotesPerVoters,
        address payable _contributionReward //address of the contract to redeem from.
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
        uint256 _reputation
    );

    event SnapshotBlock(
        bytes32 indexed _proposalId,
        uint256 _snapshotBlock
    );

    // A struct holding the data for a competition proposal
    struct Proposal {
        uint256 numberOfWinners;
        uint256[] rewardSplit;
        uint256 startTime;
        uint256 votingStartTime;
        uint256 endTime;
        uint256 numberOfVotesPerVoters;
        address payable contributionReward; //address of the contract to redeem from.
        uint256 snapshotBlock;
        uint256[] topSuggestionsOrdered;
        //mapping from suggestions totalVotes to the number of suggestions with the same totalVotes.
        mapping(uint256=>uint256) tiesSuggestions;
        mapping(address=>uint256) votesPerVoter;
    }

    struct Suggestion {
        uint256 totalVotes;
        bytes32 proposalId;
        address suggester;
        mapping(address=>uint256) votes;
    }

    //mapping from proposalID to Proposal
    //this is private due to avoid use of pragma experimental ABIEncoderV2;
    mapping(bytes32=>Proposal) public proposals;

    //mapping from suggestionId to Suggestion
    mapping(uint256=>Suggestion) public suggestions;


    uint256 public suggestionsCounter;

    function proposeCompetition(
            string memory _descriptionHash,
            int256 _reputationChange,
            uint[3] memory _rewards,
            IERC20 _externalToken,
            uint256[] memory _rewardSplit,
            uint256 _startTime,
            uint256 _votingStartTime,
            uint256 _endTime,
            uint256 _numberOfVotesPerVoters,
            address payable _contributionReward //address of the contract to redeem from.
    )
    public
    returns(bytes32 proposalId)
    {
        uint256 numberOfWinners = _rewardSplit.length;
        require(numberOfWinners <= MAX_NUMBER_OF_WINNERS,
        "number of winners greater than max allowed");
        require(_votingStartTime < _endTime,
        "voting start time greater than end time");
        require(_votingStartTime >= _startTime,
        "voting start time smaller than start time");
        require(_numberOfVotesPerVoters > 0,
        "numberOfVotesPerVoters should be greater than 0");

        uint256 totalRewardSplit;
        for (uint256 i = 0; i < numberOfWinners; i++) {
            totalRewardSplit = totalRewardSplit.add(_rewardSplit[i]);
        }
        require(totalRewardSplit == 100, "total rewards split is not 100%");

        proposalId = ContributionRewardExt(_contributionReward).proposeContributionReward(
                _descriptionHash,
                _reputationChange,
                _rewards,
                _externalToken,
                _contributionReward,
                msg.sender);
        uint256 startTime = _startTime;
        if (startTime == 0) {
          // solhint-disable-next-line not-rely-on-time
            startTime = now;
        }
        proposals[proposalId] = Proposal({
            numberOfWinners: numberOfWinners,
            rewardSplit: _rewardSplit,
            startTime: startTime,
            votingStartTime: _votingStartTime,
            endTime: _endTime,
            numberOfVotesPerVoters: _numberOfVotesPerVoters,
            contributionReward: _contributionReward,
            snapshotBlock: 0,
            topSuggestionsOrdered: new uint256[](numberOfWinners)
        });

        emit NewCompetitionProposal(
            proposalId,
            numberOfWinners,
            _rewardSplit,
            startTime,
            _votingStartTime,
            _endTime,
            _numberOfVotesPerVoters,
            _contributionReward
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
        require(proposals[_proposalId].startTime <= now, "competition not started yet");
        // solhint-disable-next-line not-rely-on-time
        require(proposals[_proposalId].endTime > now, "competition ended");
        suggestionsCounter = suggestionsCounter.add(1);
        suggestions[suggestionsCounter].proposalId = _proposalId;
        suggestions[suggestionsCounter].suggester = msg.sender;
        emit NewSuggestion(_proposalId, suggestionsCounter, _descriptionHash, msg.sender);
        return suggestionsCounter;
    }

    function setSnapshotBlock(bytes32 _proposalId) public {
        // solhint-disable-next-line not-rely-on-time
        require(proposals[_proposalId].votingStartTime < now, "voting period not started yet");
        if (proposals[_proposalId].snapshotBlock == 0) {
            proposals[_proposalId].snapshotBlock = block.number;
            emit SnapshotBlock(_proposalId, block.number);
        }
    }

    function vote(uint256 _suggestionId)
    public
    returns(bool)
    {
        bytes32 proposalId = suggestions[_suggestionId].proposalId;
        require(proposalId != bytes32(0), "suggestion not exist");
        setSnapshotBlock(proposalId);
        Proposal storage proposal = proposals[proposalId];
        // solhint-disable-next-line not-rely-on-time
        require(proposal.endTime > now, "competition ended");
        Suggestion storage suggestion = suggestions[_suggestionId];
        require(suggestion.votes[msg.sender] == 0, "already voted on this suggestion");
        require(proposal.votesPerVoter[msg.sender] < proposal.numberOfVotesPerVoters,
        "exceed number of votes allowed");
        proposal.votesPerVoter[msg.sender] = proposal.votesPerVoter[msg.sender].add(1);
        suggestion.votes[msg.sender] = suggestion.votes[msg.sender].add(1);
        Avatar avatar = ContributionRewardExt(proposal.contributionReward).avatar();
        uint256 reputation = avatar.nativeReputation().balanceOfAt(msg.sender, proposals[proposalId].snapshotBlock);
        require(reputation > 0, "voter has no reputation");
        suggestion.totalVotes = suggestion.totalVotes.add(reputation);
        suggestion.votes[msg.sender] = reputation;
        proposal.tiesSuggestions[suggestion.totalVotes] = proposal.tiesSuggestions[suggestion.totalVotes].add(1);
        refreshTopSuggestions(proposalId, _suggestionId);
        emit NewVote(proposalId, _suggestionId, msg.sender, reputation);
        return true;
    }

    function redeem(uint256 _suggestionId, address payable _beneficiary) public {
        require(suggestions[_suggestionId].totalVotes > 0, "no one vote for this suggestion");
        bytes32 proposalId = suggestions[_suggestionId].proposalId;
        require(proposalId != bytes32(0), "suggestion not exist");
        Proposal storage proposal = proposals[proposalId];
        // solhint-disable-next-line not-rely-on-time
        require(proposal.endTime > now, "competition is still on");
        uint256 amount;
        //check if there is a win
        for (uint256 i = 0; i < proposal.numberOfWinners; i++) {
            if (suggestions[proposal.topSuggestionsOrdered[i]].suggester == _beneficiary) {
                uint256 orderIndex = getOrderedIndexOfSuggestion(proposalId, _suggestionId);
                suggestions[_suggestionId].suggester = address(0);
                uint256 rewardPercentage = 0;
                uint256 numberOfTieSuggestions = proposal.tiesSuggestions[suggestions[_suggestionId].totalVotes];
                //calc the reward percentage for this suggestion
                for (uint256 j=orderIndex; j < (orderIndex+numberOfTieSuggestions); j++) {
                    rewardPercentage = rewardPercentage.add(proposal.rewardSplit[j]);
                }
                rewardPercentage = rewardPercentage.div(numberOfTieSuggestions);

                amount = ContributionRewardExt(proposal.contributionReward)
                .getProposalExternalTokenReward(proposalId).mul(rewardPercentage).div(100);
                ContributionRewardExt(proposal.contributionReward).redeemExternalTokenFromExtContract(
                proposalId,
                _beneficiary,
                amount);

                amount = uint256(ContributionRewardExt(proposal.contributionReward)
                .getProposalReputationReward(proposalId)).mul(rewardPercentage).div(100);
                ContributionRewardExt(proposal.contributionReward).redeemReputationFromExtContract(
                proposalId,
                _beneficiary,
                amount);

                amount = ContributionRewardExt(proposal.contributionReward)
                .getProposalEthReward(proposalId).mul(rewardPercentage).div(100);
                ContributionRewardExt(proposal.contributionReward).redeemEtherFromExtContract(
                proposalId,
                _beneficiary,
                amount);

                amount = ContributionRewardExt(proposal.contributionReward)
                .getProposalNativeTokenReward(proposalId).mul(rewardPercentage).div(100);
                ContributionRewardExt(proposal.contributionReward).redeemNativeTokenFromExtContract(
                proposalId,
                _beneficiary,
                amount);
                break;
            }
        }
    }

    function getOrderedIndexOfSuggestion(bytes32 _proposalId, uint256 _suggestionId)
    public
    view
    returns(uint256 index) {
        uint256[] memory topSuggestionsOrdered = proposals[_proposalId].topSuggestionsOrdered;
        /** get how many elements are greater than a given element
           + how many elements are equal to agiven element **/
        for (uint256 i; i < proposals[_proposalId].numberOfWinners; i++) {
            if (suggestions[topSuggestionsOrdered[i]].totalVotes > suggestions[_suggestionId].totalVotes) {
                index++;
            }
        }
    }

    function refreshTopSuggestions(bytes32 _proposalId, uint256 _suggestionId) internal {
        uint256[] storage topSuggestionsOrdered = proposals[_proposalId].topSuggestionsOrdered;
        /** get the index of the smallest element **/
        uint256 smallest = 0;
        for (uint256 i; i < proposals[_proposalId].numberOfWinners; i++) {
            if (suggestions[topSuggestionsOrdered[i]].totalVotes > smallest) {
                smallest++;
            }
        }

        if (suggestions[topSuggestionsOrdered[smallest]].totalVotes < suggestions[_suggestionId].totalVotes) {
            topSuggestionsOrdered[smallest] = _suggestionId;
        }
    }
}
