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
        address payable _contributionRewardExt //address of the contract to redeem from.
    );

    event Redeem(
        bytes32 indexed _proposalId,
        uint256 indexed _suggestionId,
        uint256 _rewardPercentage
    );

    event NewSuggestion(
        bytes32 indexed _proposalId,
        uint256 indexed _suggestionId,
        string indexed _descriptionHash,
        address payable _suggester
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
        address payable contributionRewardExt;
        uint256 snapshotBlock;
        //contributionRewardExt
        uint256 reputationReward;
        uint256 ethReward;
        uint256 nativeTokenReward;
        uint256 externalTokenReward;

        uint256[] topSuggestionsOrdered;
        //mapping from suggestions totalVotes to the number of suggestions with the same totalVotes.
        mapping(uint256=>uint256) tiesSuggestions;
        mapping(address=>uint256) votesPerVoter;
    }

    struct Suggestion {
        uint256 totalVotes;
        bytes32 proposalId;
        address payable suggester;
        mapping(address=>uint256) votes;
    }

    //mapping from proposalID to Proposal
    mapping(bytes32=>Proposal) public proposals;
    //mapping from suggestionId to Suggestion
    mapping(uint256=>Suggestion) public suggestions;
    uint256 public suggestionsCounter;
    address payable public contributionRewardExt; //address of the contract to redeem from.

    /**
     * @dev initialize
     * @param _contributionRewardExt the contributionRewardExt scheme which
     *        manage and allocate the rewards for the competition.
     */
    function initialize(address payable _contributionRewardExt) external {
        require(contributionRewardExt == address(0), "can be called only one time");
        require(_contributionRewardExt != address(0), "contributionRewardExt cannot be zero");
        contributionRewardExt = _contributionRewardExt;
    }

    /**
    * @dev Submit a competion proposal
    * @param _descriptionHash A hash of the proposal's description
    * @param _reputationChange - Amount of reputation change requested .Can be negative.
    * @param _rewards rewards array:
    *         rewards[0] - Amount of tokens requested per period
    *         rewards[1] - Amount of ETH requested per period
    *         rewards[2] - Amount of external tokens requested per period
    * @param _externalToken Address of external token, if reward is requested there
    * @param _rewardSplit an array of precentages which specify how to split the rewards
    *         between the winning suggestions
    * @param _competitionParams competition parameters :
    *         _competitionParams[0] - competition startTime
    *         _competitionParams[1] - _votingStartTime competition voting start time
    *         _competitionParams[2] - _endTime competition end time
    *         _competitionParams[3] - _numberOfVotesPerVoters on how many suggestions a voter can vote
    * @return proposalId the proposal id.
    */
    function proposeCompetition(
            string calldata _descriptionHash,
            int256 _reputationChange,
            uint[3] calldata _rewards,
            IERC20 _externalToken,
            uint256[] calldata _rewardSplit,
            uint256[4] calldata _competitionParams
    )
    external
    returns(bytes32 proposalId) {
        uint256 numberOfWinners = _rewardSplit.length;
        require(numberOfWinners <= MAX_NUMBER_OF_WINNERS, "number of winners greater than max allowed");
        require(_competitionParams[1] < _competitionParams[2], "voting start time greater than end time");
        require(_competitionParams[1] >= _competitionParams[0], "voting start time smaller than start time");
        require(_competitionParams[3] > 0, "numberOfVotesPerVoters should be greater than 0");

        uint256 totalRewardSplit;
        for (uint256 i = 0; i < numberOfWinners; i++) {
            totalRewardSplit = totalRewardSplit.add(_rewardSplit[i]);
        }
        require(totalRewardSplit == 100, "total rewards split is not 100%");

        proposalId = ContributionRewardExt(contributionRewardExt).proposeContributionReward(
                _descriptionHash,
                _reputationChange,
                _rewards,
                _externalToken,
                contributionRewardExt,
                msg.sender);
        uint256 startTime = _competitionParams[0];
        if (startTime == 0) {
          // solhint-disable-next-line not-rely-on-time
            startTime = now;
        }

        proposals[proposalId].numberOfWinners = numberOfWinners;
        proposals[proposalId].rewardSplit = _rewardSplit;
        proposals[proposalId].startTime = startTime;
        proposals[proposalId].votingStartTime = _competitionParams[1];
        proposals[proposalId].endTime = _competitionParams[2];
        proposals[proposalId].numberOfVotesPerVoters = _competitionParams[3];
        proposals[proposalId].reputationReward = uint256(_reputationChange);
        proposals[proposalId].nativeTokenReward = _rewards[0];
        proposals[proposalId].ethReward = _rewards[1];
        proposals[proposalId].externalTokenReward = _rewards[2];

        emit NewCompetitionProposal(
            proposalId,
            numberOfWinners,
            proposals[proposalId].rewardSplit,
            startTime,
            proposals[proposalId].votingStartTime,
            proposals[proposalId].endTime,
            proposals[proposalId].numberOfVotesPerVoters,
            contributionRewardExt
        );
    }

    /**
    * @dev suggest a competion suggestion
    * @param _proposalId the proposal id this suggestion is referring to.
    * @param _descriptionHash a descriptionHash of the suggestion.
    * @return suggestionId the suggestionId.
    */
    function suggest(
            bytes32 _proposalId,
            string calldata _descriptionHash
    )
    external
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

    /**
    * @dev vote on a suggestion
    * @param _suggestionId suggestionId
    * @return bool
    */
    function vote(uint256 _suggestionId)
    external
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
        Avatar avatar = ContributionRewardExt(contributionRewardExt).avatar();
        uint256 reputation = avatar.nativeReputation().balanceOfAt(msg.sender, proposals[proposalId].snapshotBlock);
        require(reputation > 0, "voter has no reputation");
        suggestion.totalVotes = suggestion.totalVotes.add(reputation);
        suggestion.votes[msg.sender] = reputation;
        proposal.tiesSuggestions[suggestion.totalVotes] = proposal.tiesSuggestions[suggestion.totalVotes].add(1);
        refreshTopSuggestions(proposalId, _suggestionId);
        emit NewVote(proposalId, _suggestionId, msg.sender, reputation);
        return true;
    }

    /**
    * @dev redeem a winning suggestion reward
    * @param _suggestionId suggestionId
    * @param _beneficiary - the reward beneficiary.
    *        this parameter is take into account only if the msg.sender is the suggestion's suggester,
    *        otherwise the _beneficiary param is ignored and the beneficiary is suggestion's suggester.
    */
    function redeem(uint256 _suggestionId, address payable _beneficiary) external {
        address payable beneficiary = suggestions[_suggestionId].suggester;
        if (msg.sender == suggestions[_suggestionId].suggester) {
            //only suggester can redeem to other address
            if (beneficiary != address(0)) {
                beneficiary = _beneficiary;
            }
        }
        _redeem(_suggestionId, beneficiary);
    }

    /**
    * @dev setSnapshotBlock set the block for the reputaion snapshot
    * @param _proposalId the proposal id
    */
    function setSnapshotBlock(bytes32 _proposalId) public {
        // solhint-disable-next-line not-rely-on-time
        require(proposals[_proposalId].votingStartTime < now, "voting period not started yet");
        if (proposals[_proposalId].snapshotBlock == 0) {
            proposals[_proposalId].snapshotBlock = block.number;
            emit SnapshotBlock(_proposalId, block.number);
        }
    }

    /**
    * @dev getOrderedIndexOfSuggestion return the index of specific suggestion in the winners list.
    * @param _proposalId proposal id
    * @param _suggestionId suggestion id
    */
    function getOrderedIndexOfSuggestion(bytes32 _proposalId, uint256 _suggestionId)
    public
    view
    returns(uint256 index) {
        uint256[] memory topSuggestionsOrdered = proposals[_proposalId].topSuggestionsOrdered;
        /** get how many elements are greater than a given element*/
        for (uint256 i; i < topSuggestionsOrdered.length; i++) {
            if (suggestions[topSuggestionsOrdered[i]].totalVotes > suggestions[_suggestionId].totalVotes) {
                index++;
            }
        }
    }

    /**
    * @dev refreshTopSuggestions this function maintain a winners list array.
    * @param _proposalId proposal id
    * @param _suggestionId suggestion id
    */
    function refreshTopSuggestions(bytes32 _proposalId, uint256 _suggestionId) private {
        uint256[] storage topSuggestionsOrdered = proposals[_proposalId].topSuggestionsOrdered;
        if (topSuggestionsOrdered.length < proposals[_proposalId].numberOfWinners) {
            topSuggestionsOrdered.push(_suggestionId);
        } else {
         /** get the index of the smallest element **/
            uint256 smallest = 0;
            for (uint256 i; i < proposals[_proposalId].numberOfWinners; i++) {
                if (suggestions[topSuggestionsOrdered[i]].totalVotes <
                    suggestions[topSuggestionsOrdered[smallest]].totalVotes) {
                    smallest = i;
                }
            }

            if (suggestions[topSuggestionsOrdered[smallest]].totalVotes < suggestions[_suggestionId].totalVotes) {
                topSuggestionsOrdered[smallest] = _suggestionId;
            }
        }
    }

    /**
    * @dev redeem a winning suggestion reward
    * @param _suggestionId suggestionId
    * @param _beneficiary - the reward beneficiary
    */
    function _redeem(uint256 _suggestionId, address payable _beneficiary) private {
        bytes32 proposalId = suggestions[_suggestionId].proposalId;
        require(proposalId != bytes32(0), "suggestion not exist");
        Proposal storage proposal = proposals[proposalId];
        // solhint-disable-next-line not-rely-on-time
        require(proposal.endTime < now, "competition is still on");
        uint256 amount;
        //check if there is a win
        for (uint256 i = 0; i < proposal.topSuggestionsOrdered.length; i++) {
            if (suggestions[proposal.topSuggestionsOrdered[i]].suggester != address(0)) {
                uint256 orderIndex = getOrderedIndexOfSuggestion(proposalId, _suggestionId);
                suggestions[_suggestionId].suggester = address(0);
                uint256 rewardPercentage = 0;
                uint256 numberOfTieSuggestions = proposal.tiesSuggestions[suggestions[_suggestionId].totalVotes];
                uint256 j;
                //calc the reward percentage for this suggestion
                for (j = orderIndex; j < (orderIndex+numberOfTieSuggestions); j++) {
                    rewardPercentage = rewardPercentage.add(proposal.rewardSplit[j]);
                }
                rewardPercentage = rewardPercentage.div(numberOfTieSuggestions);
                uint256 rewardPercentageLeft = 0;
                if (proposal.topSuggestionsOrdered.length < proposal.numberOfWinners) {
                    for (j = proposal.topSuggestionsOrdered.length; j < proposal.numberOfWinners; j++) {
                        rewardPercentageLeft = rewardPercentageLeft.add(proposal.rewardSplit[j]);
                    }
                    //if there are less winners than the proposal number of winners so divide the pre allocated
                    //left reward equally between the winners
                    rewardPercentage =
                    rewardPercentage.add(rewardPercentageLeft.div(proposal.topSuggestionsOrdered.length));
                }

                amount = proposal.externalTokenReward.mul(rewardPercentage).div(100);
                ContributionRewardExt(contributionRewardExt).redeemExternalTokenFromExtContract(
                proposalId, _beneficiary, amount);

                amount = proposal.reputationReward.mul(rewardPercentage).div(100);
                ContributionRewardExt(contributionRewardExt).redeemReputationFromExtContract(
                proposalId, _beneficiary, amount);

                amount = proposal.ethReward.mul(rewardPercentage).div(100);
                ContributionRewardExt(contributionRewardExt).redeemEtherFromExtContract(
                proposalId, _beneficiary, amount);

                amount = proposal.nativeTokenReward.mul(rewardPercentage).div(100);
                ContributionRewardExt(contributionRewardExt).redeemNativeTokenFromExtContract(
                proposalId, _beneficiary, amount);
                emit Redeem(proposalId, _suggestionId, rewardPercentage);
                break;
            }
        }
    }

}
