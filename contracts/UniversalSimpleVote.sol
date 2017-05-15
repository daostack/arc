pragma solidity ^0.4.11;

import "./controller/Controller.sol";
import "./controller/Reputation.sol";

contract UniversalSimpleVote is SafeMath {

    struct Proposal {
        address owner;
        Reputation reputationSystem;
        uint yes; // total 'yes' proposals
        uint no; // total 'no' proposals
        uint absPrecReq; // Usuualy >= 50
        mapping(address=>bool) voted; // people in this list have already voted
        bool opened; // A flag that voting opened
        bool ended; // voting had ended flag
    }

    event NewProposal( bytes32 _proposalId, address owner, Reputation _reputationSystem, uint absPrecReq);
    event VoteProposal( address _voter, bytes32 _proposalId, bool _yes, uint _reputation );
    event EndProposal( bytes32 _proposalId );
    event CancellProposal( bytes32 _proposalId );

    mapping(bytes32=>Proposal) proposals;

    function UniversalSimpleVote() {
    }

    function propose(Reputation _reputationSystem, uint _absPrecReq) returns(bytes32) {
      // Do we want to make sure that proposing a proposal will be done only by registered schemes?
      require(_absPrecReq <= 100);
      Proposal memory proposal;
      bytes32 id;
      proposal.reputationSystem = _reputationSystem;
      proposal.owner = msg.sender;
      proposal.opened = true;
      proposal.absPrecReq = _absPrecReq;
      id = sha3(_reputationSystem, msg.sender, _absPrecReq);
      while (proposals[id].opened)
        id = sha3(id^sha3(id));
      proposals[id] = proposal;
      NewProposal(id, msg.sender, _reputationSystem, _absPrecReq);
      return id;
    }

    function cancellProposel(bytes32 id) returns(bool) {
        require(msg.sender == proposals[id].owner);
        delete proposals[id];
        CancellProposal(id);
        return true;
    }

    function vote(bytes32 id, bool yes, address voter) returns(bool) {
        Proposal proposal = proposals[id];
        require(proposal.opened);
        require(! proposal.ended);
        require(msg.sender == proposal.owner);

        if( proposal.voted[voter] ) return false;

        uint reputation = proposal.reputationSystem.reputationOf(voter);
        uint totalReputation = proposal.reputationSystem.totalSupply();

        if (yes) {
            proposal.yes = safeAdd(proposal.yes, reputation);
        } else {
            proposal.no = safeAdd(proposal.no, reputation);
        }
        VoteProposal(voter, id, yes, reputation);

        // this is the actual voting rule:
        if( (proposal.yes > totalReputation*proposal.absPrecReq/100) || (proposal.no > totalReputation*proposal.absPrecReq/100 ) ) {
            proposal.ended = true;
            EndProposal(id);
        }
        return true;
    }

    // returns result of the proposal:
    //      true if the proposal passed
    //      false if the proposal has not passed (yet)
    function voteResults(bytes32 id) constant returns(bool) {
        Proposal proposal = proposals[id];

        if (proposal.ended && (proposal.yes > proposal.no)) {
            return true;
        } else {
            return false;
        }
    }

    function voteStatus(bytes32 id) constant returns(uint[3]) {
        uint yes = proposals[id].yes;
        uint no = proposals[id].no;
        uint ended = proposals[id].ended ? 1 : 0;

        return [yes, no, ended];
    }
}
