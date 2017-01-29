contract SimpleVote is SafeMath {
    Reputation reputationSystem;
    
    struct Votes {
        uint yes;
        uint no;
        mapping(address=>bool) voted;
        
        bool opened;
        bool closed;
    }
            
    mapping(bytes32=>Votes) proposals;
    
    
    function SimpleVote( Reputation _reputationSystem ) {
        reputationSystem = _reputationSystem;
    }
    
    function closeProposal( bytes32 proposalId ) internal returns(bool) {
        Votes votes = proposals[proposalId];
        
        delete votes;
    }
    
    function newProposal( bytes32 proposalId ) internal returns(bool) {
        Votes votes = proposals[proposalId];
        if( votes.open || votes.closed ) return false;
        
        return true;
    }
    
    function voteProposal( bytes32 proposalId, bool yes ) internal returns(bool) {
        Votes votes = proposals[proposalId];    
        if( votes.closed || ! votes.open ) return false;
        if( votes.voted[msg.sender] ) return false;
        
        uint reputation = reputationSystem.reputationOf(msg.sender);
        uint totalReputation = reputationSystem.totalSupply();
        
        if( yes ) {
             votes.yes = safeAdd(votes.yes, reputation);
        }
        else {
             votes.no = safeAdd(votes.no, reputation);        
        }
        
        if( ( votes.yes > totalReputation / 2 ) || (votes.no > totalReputation / 2  ) ) {
            votes.closed = true;
        } 
        
        return true;
    }
        
    function voteResults( bytes32 proposalId ) internal returns(bool) {
        Votes votes = proposals[proposalId];    
        if( ( votes.yes > votes.no ) && vote.closed ) return true;
        else return false;
    }


    function voteStatus( bytes32 proposalId ) constant returns(Votes) {
        return proposals[proposalId];
    }
    
        
    ////////////////////////////////////////////////////////////////////////////
    
    function propose( bytes32 _proposalId ) internal returns(bool) {
        Votes memory votes = proposals[_proposalId];
        if( ! openNewProposal( votes ) ) throw;
        
        return true;
    }

    function vote( bytes32 _proposalId, bool _yes ) internal returns(bool) {
        Votes memory votes = proposals[_scheme];
        if( ! voteProposal( votes, _yes ) ) throw;
        
        return true;
    }
    
    
}
