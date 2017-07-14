pragma solidity ^0.4.11;

import "../VotingMachines/BoolVoteInterface.sol";
import "./UniversalScheme.sol";


/**
 * @title A registrar for Schemes for organizations
 * @dev The SchemeRegistrar is used for registering and unregistering schemes at organizations
 */

contract SchemeRegistrar is UniversalScheme {

    // a SchemeProposal is a  proposal to add or remove a scheme to/from the an orgaization
    struct SchemeProposal {
        address scheme;
        bytes32 parametersHash;
        uint proposalType; // 1: add a schme, 2: remove a scheme.
        bool isRegistering;
        StandardToken tokenFee;
        uint fee;
        BoolVoteInterface boolVote; // the voting machine used for this proposal
    }

    // For each organization, the registrar records the proposals made for this organization
    // TODO: perhaps more straightforward to have a proposals mapping directly on the curent contract,
    // and have a reference to the controller as part of the SchemProposal struct
    struct Organization {
        bool isRegistered;
        mapping(bytes32=>SchemeProposal) proposals;
    }
    // A mapping from thr organization (Avatar) address to the saved data of the organization:
    mapping(address=>Organization) organizations;

    // A mapping from hashes to parameters (use to store a particular configuration on the controller)
    struct Parameters {
        bytes32 voteRegisterParams;
        bytes32 voteRemoveParams;
        BoolVoteInterface boolVote;
    }
    mapping(bytes32=>Parameters) parameters;

    /**
     * @dev The constructor
     * @param _nativeToken a Token that is used for paying fees for registering
     * @param _fee the fee to pay
     * @param _beneficiary to whom the fee is payed
     */
    function SchemeRegistrar(StandardToken _nativeToken, uint _fee, address _beneficiary) {
        updateParameters(_nativeToken, _fee, _beneficiary, bytes32(0));
    }

    /**
     * @dev hash the parameters, save them if necessary, and return the hash value
     */
    function setParameters(
        bytes32 _voteRegisterParams,
        bytes32 _voteRemoveParams,
        BoolVoteInterface _boolVote
    ) returns(bytes32) {
        bytes32 paramsHash = getParametersHash(_voteRegisterParams, _voteRemoveParams, _boolVote);
        parameters[paramsHash].voteRegisterParams = _voteRegisterParams;
        parameters[paramsHash].voteRemoveParams = _voteRemoveParams;
        parameters[paramsHash].boolVote = _boolVote;
        return paramsHash;
    }

    function getParametersHash(
        bytes32 _voteRegisterParams,
        bytes32 _voteRemoveParams,
        BoolVoteInterface _boolVote
        ) constant returns(bytes32) {
        bytes32 paramsHash = (sha3(_voteRegisterParams, _voteRemoveParams, _boolVote));
        return paramsHash;
    }

    /**
     * @dev add or update an organisation to this register.
     * @dev the sender pays a fee (in nativeToken) for using this function, and must approve it before calling the transaction
     * @param _avatar the address of the organization
     */
    function registerOrganization(Avatar _avatar) {
        // Pay fees for using scheme
        if (fee > 0) {
          nativeToken.transferFrom(_avatar, beneficiary, fee);
        }
        // TODO: should we check if the current registrar is registered already on the controller?
        /*require(checkParameterHashMatch(_avatar, _voteRegisterParams, _voteRemoveParams, _boolVote));*/

        // update the organization in the organizations mapping
        Organization memory org;
        org.isRegistered = true;
        organizations[_avatar] = org;
    }

    function isRegistered(address _avatar) constant returns(bool) {
      return organizations[_avatar].isRegistered;
    }

    /**
     * @dev create a proposal to register a scheme
     * @param _avatar the address of the organization the scheme will be registered for
     * @param _scheme the address of the scheme to be registered
     * @param _parametersHash a hash of the configuration of the _scheme
     * @param _isRegistering a boolean represent if the scheme is a registering scheme
     *      that can register other schemes
     * @param _tokenFee a token that will be used to pay any fees needed for registering the avatar
     * @param _fee the fee to be paid
     * @return a proposal Id
     * @dev NB: not only proposes the vote, but also votes for it
     */
    // TODO: check if we cannot derive isRegistering from the _scheme itself
    function proposeScheme(
        Avatar _avatar,
        address _scheme,
        bytes32 _parametersHash,
        bool _isRegistering,
        StandardToken _tokenFee,
        uint _fee
    ) returns(bytes32) {
        Organization org = organizations[_avatar];
        // Check if org is registered to use this universal scheme
        require(org.isRegistered);

        // Check if the controller doesn't already have the proposed scheme.
        Controller controller = Controller(_avatar.owner());
        require(!controller.isSchemeRegistered(_scheme));

        // propose
        Parameters controllerParams = parameters[getParametersFromController(_avatar)];

        BoolVoteInterface boolVote = controllerParams.boolVote;

        bytes32 proposalId = boolVote.propose(controllerParams.voteRegisterParams);

        if (org.proposals[proposalId].proposalType != 0) {
          revert();
        }

        org.proposals[proposalId].boolVote = boolVote;
        org.proposals[proposalId].proposalType = 1;
        org.proposals[proposalId].scheme = _scheme;
        org.proposals[proposalId].parametersHash = _parametersHash;
        org.proposals[proposalId].isRegistering = _isRegistering;
        org.proposals[proposalId].tokenFee = _tokenFee;
        org.proposals[proposalId].fee = _fee;
        // vote for this proposal
        voteScheme(_avatar, proposalId, true);
        return proposalId;
    }

    /**
     * @dev propose to remove a scheme for a controller
     * @param _avatar the address of the controller from which we want to remove a scheme
     * @param _scheme the address of the scheme we want to remove
     *
     * NB: not only registers the proposal, but also votes for it
     */
    function proposeToRemoveScheme(Avatar _avatar, address _scheme) returns(bytes32) {
        Organization org = organizations[_avatar];

        // Check if the orgazation is registred to use this universal scheme.
        require(org.isRegistered);

        bytes32 paramsHash = getParametersFromController(_avatar);
        Parameters params = parameters[paramsHash];

        BoolVoteInterface boolVote = params.boolVote;
        bytes32 proposalId = boolVote.propose(params.voteRemoveParams);
        if (org.proposals[proposalId].proposalType != 0) {
          revert();
        }
        org.proposals[proposalId].proposalType = 2;
        org.proposals[proposalId].scheme = _scheme;
        org.proposals[proposalId].boolVote = boolVote;
        // vote for this proposal
        voteScheme(_avatar, proposalId, true);
        return proposalId;
    }

    /**
     * @dev vote to register or unregister a scheme of a controller
     * @param _avatar address of the controller
     * @param _proposalId the id of the proposal
     * @param _yes a boolean representing a yes or no vote
     */
    // NB: the decisive vote will pay for gas costs for (un)registering the scheme in question
    function voteScheme(Avatar _avatar, bytes32 _proposalId, bool _yes) returns(bool) {

        // get the contents of the proposal
        SchemeProposal memory proposal = organizations[_avatar].proposals[_proposalId];
        BoolVoteInterface boolVote = proposal.boolVote;
        if (!boolVote.vote(_proposalId, _yes, msg.sender)) {
            return false;
        }
        if (boolVote.voteResults(_proposalId)) { // true if the vote has passed
            // cancel the proposal
            if (!boolVote.cancelProposal(_proposalId)) {
              revert();
            }
            Controller controller = Controller(_avatar.owner());
            // if our proposal is of type2, we unregister the schem in question
            if (organizations[_avatar].proposals[_proposalId].proposalType == 2 ) {
                if(!controller.unregisterScheme(proposal.scheme)) revert();
            }
            if (organizations[_avatar].proposals[_proposalId].proposalType == 1 ) {
                if (proposal.fee != 0 )
                  if (!controller.externalTokenApprove(proposal.tokenFee, proposal.scheme, proposal.fee)) revert();
                if (proposal.isRegistering == false)
                  if (!controller.registerScheme(proposal.scheme, proposal.parametersHash, bytes4(1))) revert();
                else
                  if (!controller.registerScheme(proposal.scheme, proposal.parametersHash, bytes4(3))) revert();
            }
            organizations[_avatar].proposals[_proposalId].proposalType = 0;
        }
        return true;
    }

    /**
     * @dev get the status of the vote
     * @param _avatar is the avatar of the organisation it is registered atproposal
     * @param _proposalId is the id of a proposal
     * @return [yes, no, ended]
     */
    function getVoteStatus(Avatar _avatar, bytes32 _proposalId) constant returns(uint[3]) {
        BoolVoteInterface boolVote = organizations[_avatar].proposals[_proposalId].boolVote;
        return (boolVote.voteStatus(_proposalId));
    }

}
