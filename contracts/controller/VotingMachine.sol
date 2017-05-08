pragma solidity ^0.4.11;

import "./Controller.sol";
import "./Reputation.sol";
import "zeppelin/contracts/token/StandardToken.sol";

contract VotingMachine is SafeMath {

    struct AbsoluteMajorityVote {
        address owner;
        uint yes; // total 'yes' votes
        uint no; // total 'no' votes
        uint absPrecReq; // should be not less than 50 usually
        mapping(address=>bool) voted; // people in this list have already voted
        bool opened; // A flag that voting opened
        bool closed; // voting is closed
    }

    event NewProposal( bytes32 _proposalId );
    event VoteProposal( address _voter, bytes32 _proposalId, bool _yes, uint _reputation );
    event CloseProposal( bytes32 _proposalId );
    event CancellProposal( bytes32 _proposalId );

    Controller      controller;
    Reputation      reputationSystem;
    StandardToken   tokenSystem;

    mapping(bytes32=>AbsoluteMajorityVote) absoluteMajorityVoteProposals;

    function VotingMachine(Controller _controller) {
      controller = _controller;
      updateReputationToken();
    }

    function updateReputationToken() {
      reputationSystem = controller.nativeReputation();
      tokenSystem = controller.nativeToken();
    }

    function proposeAbsoluteMajorityVote(uint absPrecReq) returns(bytes32) {
      /*require(controller.schemes(msg.sender)); // Do we want this?*/
      require(absPrecReq <= 100);
      AbsoluteMajorityVote memory absoluteMajorityVote;
      bytes32 id;
      absoluteMajorityVote.owner = msg.sender;
      absoluteMajorityVote.opened = true;
      id = sha3(bytes32(msg.sender)^bytes32(now)^bytes32(absPrecReq));
      while (absoluteMajorityVoteProposals[id].opened)
        id = sha3(id^id);
      absoluteMajorityVoteProposals[id] = absoluteMajorityVote;
      NewProposal(id);
      return id;
    }

    function deleteAbsoluteMajorityVote(bytes32 proposalId) returns(bool) {
        require(msg.sender == absoluteMajorityVoteProposals[proposalId].owner);
        delete absoluteMajorityVoteProposals[proposalId];
        CancellProposal(proposalId);
        return true;
    }

    function voteAbsoluteMajorityVote(bytes32 proposalId, bool yes, address voter) returns(bool) {
        AbsoluteMajorityVote vote = absoluteMajorityVoteProposals[proposalId];
        require(! vote.closed);

        if (msg.sender != vote.owner)
          voter = msg.sender;

        if( vote.voted[voter] ) return false;

        uint reputation = reputationSystem.reputationOf(voter);
        uint totalReputation = reputationSystem.totalSupply();

        if (yes) {
            vote.yes = safeAdd(vote.yes, reputation);
        } else {
            vote.no = safeAdd(vote.no, reputation);
        }

        // this is the actual voting rule:
        // the vote is closed if more than the absolute required voted yes, or more than
        // absolute required voted no.
        if( (vote.yes > totalReputation*vote.absPrecReq/100) || (vote.no > totalReputation*vote.absPrecReq/100 ) ) {
            vote.closed = true;
            CloseProposal(proposalId);
        }

        VoteProposal(voter, proposalId, yes, reputation);

        return true;
    }

    // returns result of the vote:
    //      true if the proposal passed
    //      false if the proposal has not passed (yet)
    function voteResults(bytes32 proposalId) constant returns(bool) {
        AbsoluteMajorityVote votes = absoluteMajorityVoteProposals[proposalId];

        if ((votes.yes > votes.no) && votes.closed) {
            return true;
        } else {
            return false;
        }
    }

    function voteStatus(bytes32 proposalId) constant returns(uint[3]) {
        uint yes = absoluteMajorityVoteProposals[proposalId].yes;
        uint no = absoluteMajorityVoteProposals[proposalId].no;
        uint closed = absoluteMajorityVoteProposals[proposalId].closed ? 1 : 0;

        return [yes, no, closed];
    }
}
