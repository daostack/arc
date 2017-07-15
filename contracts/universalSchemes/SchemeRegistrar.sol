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
        address scheme; //
        bytes32 parametersHash;
        uint proposalType; // 1: add a schme, 2: remove a scheme.
        bool isRegistering;
        StandardToken tokenFee;
        uint fee;
        BoolVoteInterface boolVote; // the voting machine used for this proposal
    }

    mapping(bytes32=>SchemeProposal) public proposals;

    // For each organization, the registrar records the proposals made for this organization
    struct Organization {
        bool isRegistered;
    }
    // A mapping from thr organization (Avatar) address to the saved data of the organization:
    mapping(address=>Organization) public organizations;

    // A mapping from hashes to parameters (use to store a particular configuration on the controller)
    struct Parameters {
        bytes32 voteRegisterParams;
        bytes32 voteRemoveParams;
        BoolVoteInterface boolVote;
    }
    mapping(bytes32=>Parameters) public parameters;

    event LogNewProposal(bytes32 proposalId);

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
        if (fee > 0)
          nativeToken.transferFrom(_avatar, beneficiary, fee);

        // TODO: should we check if the current registrar is registered already on the controller?
        /*require(checkParameterHashMatch(_avatar, _voteRegisterParams, _voteRemoveParams, _boolVote));*/

        // update the organization in the organizations mapping
        Organization memory org;
        org.isRegistered = true;
        organizations[_avatar] = org;
        orgRegistered(_avatar);
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
        bytes32 proposalId = boolVote.propose(controllerParams.voteRegisterParams, _avatar, ExecutableInterface(this));
        if (proposals[proposalId].proposalType != 0) {
          revert();
        }
        proposals[proposalId].boolVote = boolVote;
        proposals[proposalId].proposalType = 1;
        proposals[proposalId].scheme = _scheme;
        proposals[proposalId].parametersHash = _parametersHash;
        proposals[proposalId].isRegistering = _isRegistering;
        proposals[proposalId].tokenFee = _tokenFee;
        proposals[proposalId].fee = _fee;

        // vote for this proposal
        boolVote.vote(proposalId, true, msg.sender); // Automatically votes `yes` in the name of the opener.

        LogNewProposal(proposalId);
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
        bytes32 proposalId = boolVote.propose(params.voteRemoveParams, _avatar, ExecutableInterface(this));
        if (proposals[proposalId].proposalType != 0) {
          revert();
        }
        proposals[proposalId].proposalType = 2;
        proposals[proposalId].scheme = _scheme;
        proposals[proposalId].boolVote = boolVote;
        // vote for this proposal
        boolVote.vote(proposalId, true, msg.sender); // Automatically votes `yes` in the name of the opener.
        return proposalId;
    }

    /**
     * @dev execute a  proposal
     * This method can only be called by the voting machine in which the vote is held.
     * @param _proposalId the ID of the proposal in the voting machine
     * @param _avatar address of the controller
     * @param _param identifies the action to be taken
     */
    // TODO: this call can be simplified if we save the _avatar together with the proposal
    function execute(bytes32 _proposalId, address _avatar, int _param) returns(bool) {
      Controller controller = Controller(Avatar(_avatar).owner());

      // XXX: next lines eems to be a bug: in this way anyone can delete a proposal from the list
      if (_param != 1) {
        delete proposals[_proposalId];
        return true;
      }
      // Check the caller is indeed the voting machine:
      require(parameters[getParametersFromController(Avatar(_avatar))].boolVote == msg.sender);
      // Define controller and get the parmas:
      SchemeProposal proposal = proposals[_proposalId];

      // Add a scheme:
      if (proposal.proposalType == 1)  {
          if (proposal.fee != 0) {
            if (!controller.externalTokenApprove(proposal.tokenFee, proposal.scheme, proposal.fee)) {
              revert();
            }
          }
          if (proposal.isRegistering == false) {
            if (!controller.registerScheme(proposal.scheme, proposal.parametersHash, bytes4(1))) {
              revert();
            }
          } else {
            if (!controller.registerScheme(proposal.scheme, proposal.parametersHash, bytes4(3))) {
              revert();
            }
          }
      }
      // Remove a scheme:
      if( proposal.proposalType == 2 ) {
          if(!controller.unregisterScheme(proposal.scheme)) {
            revert();
          }
      }

      delete proposals[_proposalId];
      return true;
    }
}
