import "./SystemValue.sol";


contract Pay is ActionInterface {
    address to;
    uint    amountInWei;
    
    
    function Pay( address _to, uint _amountInWei ) {
        to = _to;
        amountInWei = _amountInWei;
    }
    function action( uint _param ) returns(bool) {
        if( ! to.send( amountInWei ) ) throw;    
    }
    function kill() {
        selfdestruct(msg.sender); // owner is irrelevant
    }
}

contract DAOCreator { // to avoid compilation errors
    function createDAO( TheDAO _parentDAO, uint _ICOCap ) returns(TheDAO){
        return new TheDAO(_parentDAO, _ICOCap);
    }
}

contract TheDAO {
    
    ValueSystem system;
    TheDAO      parentDAO;
    uint        cap;
    
    function TheDAO( TheDAO _parentDAO, uint _ICOCap ) {
        parentDAO = _parentDAO;
        system = new ValueSystem( "TheDAO", "DAO", this );
        cap = _ICOCap;
    }

    // voting data - TODO - consider ballot contract
    struct Vote {
        uint yes;
        uint no;
        mapping(address=>bool) voted;
        
        address to;
        uint amountInWei;
        
        bool excecuted;
    }
    
    struct Split {
        address                spliter;
        mapping(address=>uint) joiners; // user to token
        uint                   deadlineToJoinTimestamp;
        address                newDAO;
        bool                   splitWasDone;
    }
    
    Vote[]  votes;
    Split[] public splits;
    
    mapping(uint=>mapping(address=>bool)) collectedFromParentDAO;
    
    
    function ico( ) { // 1 wei == 1 Token unit (10^-18) and 2 reputation
        system.mintTokens( int(msg.value), msg.sender );
        if( system.nativeToken().totalSupply() > cap ) throw;
        // send ether to system
        if( ! system.send( msg.value ) ) throw;
    }
    
    function newPropsoal(address _to, uint _amountInWei ) returns(uint) {
        if( system.nativeToken().balanceOf(msg.sender) < 100 ) throw; // not allowed to propose 
        Vote memory vote;
        vote.to = _to;
        vote.amountInWei = _amountInWei;
        votes.push(vote);
    }
    
    function voteProposal( bool yes, uint proposal ) {
        Vote vote = votes[proposal];
        if( vote.voted[msg.sender] ) throw;
        uint count = system.nativeToken().balanceOf(msg.sender);
        if( yes ) vote.yes += count;
        else vote.no += count;
        vote.voted[msg.sender] = true;
    }
    

    function excecuteProposal( uint proposal ) {
        Vote vote = votes[proposal];
        if( vote.excecuted ) throw;

        // do payment
        Pay pay = new Pay(vote.to, vote.amountInWei);
        // could fail, e.g., if not enough money
        if( ! system.genericAction(pay, 0xbaccfeed) ) throw;
        pay.kill();
        
        vote.excecuted = true;
    }
 
    // split stuff
    
    function newSplit( ) {
        Split memory split;
        split.spliter = msg.sender;
        split.deadlineToJoinTimestamp = now + 2 weeks;

        // split fees
        system.nativeToken().transferFrom(msg.sender, system, 1 );
        system.mintTokens( -1, system ); // burn token

        splits.push(split);
    }
    
    function joinSplit( uint splitId, uint tokens ) {
        Split split = splits[ splitId ];
        if( now > split.deadlineToJoinTimestamp ) throw;
        splits[ splitId ].joiners[msg.sender] = tokens;
        
        system.nativeToken().transferFrom(msg.sender, system, tokens );
        system.mintTokens( -1 * int(tokens), system ); // burn tokens
    }
 
    function createNewDAO(TheDAO _parentDAO, uint _ICOCap) internal returns (TheDAO){
        DAOCreator creator;
        return creator.createDAO(_parentDAO, _ICOCap );         
    }
    
    
    
    function executeSplit( uint splitId ) {
        Split split = splits[ splitId ];
        if( split.splitWasDone ) throw;
        if( split.deadlineToJoinTimestamp > now ) throw;
        split.newDAO = createNewDAO( this, 0 );
        split.splitWasDone = true;
    }
  
    function getBalanceInSplit( uint splitId, address joiner ) constant returns(uint) {
        return splits[splitId].joiners[joiner];
    }
  
    function claimParentTokens( uint splitId ) {
        if( parentDAO == address(0x0) ) throw;
        if((collectedFromParentDAO[splitId])[msg.sender]) throw;
        
        uint amount = parentDAO.getBalanceInSplit(splitId, msg.sender);
        system.mintTokens( int(amount), msg.sender );
        (collectedFromParentDAO[splitId])[msg.sender] = true;
    }

    // upgrade
    
    function upgradeDAO( address newDAO ) {
        // TODO make vote before doing it
        system.registerScheme( newDAO );
        system.unregisterScheme( this ); // note that order is super important here
    }
    
}