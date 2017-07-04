pragma solidity ^0.4.11;

import "../controller/Controller.sol";
import "../VotingMachines/BoolVoteInterface.sol";
import "./UniversalScheme.sol";


/**
 * @title A registrar for Schemes for organizations
 * @dev The SchemeRegistrar is used for registering and unregistering schemes at organizations
 */

// TODO: perhaps rename to "Registrar", since (apart from tracking proposals) does not 
// really keep a register of anything at all

contract SchemeRegistrar is UniversalScheme {

    // a SchemeProposal is a  proposal to add or remove a scheme to/from the register
    struct SchemeProposal {
        address scheme;
        bytes32 parametersHash;
        uint proposalType; // 1: add a schme, 2: remove a scheme.
        bool isRegistering;
    }

    // For each organization, the register records the proposals made for this
    // organization and the conditions under which these proposals will be accepted
    struct Organization {
        bool isRegistered;
        bytes32 voteRegisterParams;
        bytes32 voteRemoveParams;
        BoolVoteInterface boolVote;
        mapping(bytes32=>SchemeProposal) proposals;
    }

    mapping(address=>Organization) organizations;


    /**
     * The constructor
     * @param _nativeToken a Token that is used for paying fees for registering
     * @param _fee the fee to pay
     * @param _beneficiary to whom the fee is payed
     */
    function SchemeRegistrar(StandardToken _nativeToken, uint _fee, address _beneficiary) {
        updateParameters(_nativeToken, _fee, _beneficiary, bytes32(0));
    }


    /**
     * @dev create an Id for an organization. The parameters are those for adding
     * an organization
     * 
     */
    function parametersHash(
        bytes32 _voteRegisterParams,
        bytes32 _voteRemoveParams,
        BoolVoteInterface _boolVote
    ) constant returns(bytes32) {
        return (sha3(_voteRegisterParams, _voteRemoveParams, _boolVote));
    }

    // check if the current register is registered on the given controller
    // with the given parameters 
    function checkParameterHashMatch(
        Controller _controller,
        bytes32 _voteRegisterParams,
        bytes32 _voteRemoveParams,
        BoolVoteInterface _boolVote
    ) private constant returns(bool) {
       return (_controller.getSchemeParameters(this) == parametersHash(_voteRegisterParams,_voteRemoveParams,_boolVote));
    }

    /**
     * @dev add or update an organisation to this register. 
     * @dev the sender pays a fee (in nativeToken) for using this function, and must approve it before calling the transaction
     * @param _controller the address of the organization
     * @param _voteRegisterParams a hash representing the conditions for registering new schemes
     * @param _voteRemoveParams a hash representing the conditions under which a schema can be removed
     * @param _boolVote a voting machine used for voting to add or delete schemes
     */
    function addOrUpdateOrg(
        Controller _controller,
        bytes32 _voteRegisterParams,
        bytes32 _voteRemoveParams,
        BoolVoteInterface _boolVote
    ) {
        // Pay fees for using scheme
        // TODO: do not call at all if fee is 0 to save gas
        nativeToken.transferFrom(msg.sender, beneficiary, fee);

        // TODO: this would be cleared if it looked something like:
        // _controller.isRegisteredScheme(this, hash(configuration))
        // or even:
        // _controller.isRegisteredScheme(hash(this, configuration))
        // or abstract it in a local:
        //   validateOrganization(Organization org)

        // we require that the current register is registered as a scheme in the organization
        require(_controller.isSchemeRegistered(this));
        return
        // check if indeed the parameters given here are those registered at the controller
        require(checkParameterHashMatch(_controller, _voteRegisterParams, _voteRemoveParams, _boolVote));

        // now update the organization in the organizations mapping
        Organization memory org;
        org.isRegistered = true;
        // TODO: this information should be stored on the controller, just as in the other cases
        org.voteRegisterParams = _voteRegisterParams;
        org.voteRemoveParams = _voteRemoveParams;
        org.boolVote = _boolVote;
        organizations[_controller] = org;
    }

    /**
     * @dev propose a vote to register a scheme in the current register
     * @param _controller the address of the organization
     * @param _scheme the address of the scheme to be approved
     * @param _parametersHash a hash of the configuration of the _scheme 
     * @param _isRegistering a boolean represent if the scheme is a registering scheme
     *      that can register other schemes
     *
     * @dev NB: not only proposes the vote, but also votes for it
     */
    // TODO: check if we cannot derive isRegistering from the _scheme itself

    function proposeScheme(
        Controller _controller,
        address _scheme, 
        bytes32 _parametersHash,
        bool _isRegistering
    ) returns(bytes32) {
        // Check org is registred to use this universal scheme
        Organization org = organizations[_controller];
        require(org.isRegistered); 

        // check if the configuration of the current scheme matches that of the controller
        require(checkParameterHashMatch(
            _controller,
            org.voteRegisterParams,
            org.voteRemoveParams,
            org.boolVote
        ));
        // Check if the controller does'nt already have the proposed scheme.
        require(! _controller.isSchemeRegistered(_scheme));

        // propose 
        BoolVoteInterface boolVote = org.boolVote;
        bytes32 id = boolVote.propose(org.voteRegisterParams);

        if (org.proposals[id].proposalType != 0) revert();

        org.proposals[id].proposalType = 1;
        org.proposals[id].scheme = _scheme;
        org.proposals[id].parametersHash = _parametersHash;
        org.proposals[id].isRegistering = _isRegistering;
        // vote for this proposal
        voteScheme(_controller, id, true);
        return id;
    }

    /**
     * @dev propose to remove a scheme for a controller
     * @param _controller the address of the controller from which we want to remove a scheme
     * @param _scheme the address of the scheme we want to remove
     *
     * NB: not only registers the proposal, but also votes for it
     */
    function proposeToRemoveScheme(Controller _controller, address _scheme) returns(bytes32) {
        Organization org = organizations[_controller];
        require(org.isRegistered); // Check org is registred to use this universal scheme.
        require(_controller.isSchemeRegistered(_scheme)); // Check the scheme is registered in controller.
        require(checkParameterHashMatch(
            _controller,
            org.voteRegisterParams,
            org.voteRemoveParams,
            org.boolVote
        ));
        BoolVoteInterface boolVote = org.boolVote;
        bytes32 proposalId = boolVote.propose(org.voteRemoveParams);
        if (org.proposals[proposalId].proposalType != 0) revert();
        org.proposals[proposalId].proposalType = 2;
        org.proposals[proposalId].scheme = _scheme;
        // vote for this proposal
        voteScheme(_controller, proposalId, true);
        return proposalId;
    }

    /**
     * @dev vote to register or unregister a scheme of a controller
     * @param _controller address of the controller
     * @param _proposalId the id of the proposal
     * @param _yes a boolean representing a yes or no vote
     */
    // NB: the decisive vote will pay for gas costs for (un)registering the scheme in question 
    // TODO: security: we are not checking here if the registeration on the controller of the present register has changed
    // since we propossed the vote
    function voteScheme(Controller _controller, bytes32 _proposalId, bool _yes) returns(bool) {
        BoolVoteInterface boolVote = organizations[_controller].boolVote;
        if (! boolVote.vote(_proposalId, _yes, msg.sender)) return false;
        if (boolVote.voteResults(_proposalId)) { // true if the vote has passed

            // get the contents of the proposal
            SchemeProposal memory proposal = organizations[_controller].proposals[_proposalId];

            // cancel the proposal
            if (!boolVote.cancelProposal(_proposalId)) revert();

            // if our proposal is of type2, we unregister the schem in question
            if (organizations[_controller].proposals[_proposalId].proposalType == 2 ) {
                if(!_controller.unregisterScheme(proposal.scheme)) {
                  revert();
                }
            }
            if (organizations[_controller].proposals[_proposalId].proposalType == 1 ) {
                if (!_controller.registerScheme(proposal.scheme, proposal.isRegistering, proposal.parametersHash)) {
                  revert();
                }
            }
            organizations[_controller].proposals[_proposalId].proposalType = 0;
        }
    }

    /**
     * @dev get the status of the vote 
     * @return [yes, no, ended]
     */
    function getVoteStatus(Controller _controller, bytes32 id) constant returns(uint[3]) {
        BoolVoteInterface boolVote = organizations[_controller].boolVote;
        return (boolVote.voteStatus(id));
    }
}
