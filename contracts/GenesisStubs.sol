pragma solidity ^0.4.4;

import "./zeppelin-solidity/SafeMath.sol";
import "./SystemValueInterface.sol";
import "./Reputation.sol";

contract GenesisScheme is SafeMath {
    Reputation           public reputation;
    ValueSystemInterface public system;
    bool                 public active;
    
    struct Vote {
        mapping(address=>bool) voted; // for genesis cannot change vote

        uint yesCount;
        uint noCount;
    }
    
    mapping(address=>Vote) votes;
    
    function GenesisScheme( Reputation _reputation, ValueSystemInterface _system ) {
        reputation = _reputation;
        system = _system;
        active = true;
    } 
    
    function vote( bool _yes, address _newScheme ) {
        if( ! active ) throw;
        
        Vote vote = votes[_newScheme];
        if( vote.voted[msg.sender] ) throw;
        uint rep      = reputation.reputationOf(msg.sender);
        uint totalRep = reputation.totalSupply();
        
        if( _yes ) vote.yesCount = safeAdd( vote.yesCount, rep );
        else vote.noCount = safeAdd( vote.noCount, rep );
        
        if( vote.yesCount > totalRep / 2 ) { // strict majority
            if( ! system.registerScheme( _newScheme ) ) throw;
            if( ! system.unregisterScheme( this ) ) throw;
            active = false;
            // kill contract? god knows if it reverts actions. probably not
        }
    }
}

////////////////////////////////////////////////////////////////////////////////

contract GenesisGlobalConstraint is GlobalConstraintInterface {
    function pre( uint _param )  returns(bool) { return true; }
    function post( uint _param ) returns(bool) { return true; }    
}

