pragma solidity ^0.4.11;

import "../VotingMachines/BoolVoteInterface.sol";
import "./UniversalScheme.sol";

/**
 * @title A scheme to manage global constaintg for organizations
 * @dev The scheme is used to register or remove new global constraints
 */
contract GlobalConstraintRegistrar is UniversalScheme {

    // The struct that holds the information of a global constraint proposed to be added or removed.
    struct GCProposal {
        address gc; // The address of the global contraint contract.
        bytes32 params; // Parameters for global constraint.
        uint proposalType; // 1: add a GC, 2: remove a GC.
        bytes32 removeParams; // Voting parameters for removing this GC.
    }

    mapping(bytes32=>GCProposal) public proposals;

    // Struct holding the data for each organization
    struct Organization {
        bool isRegistered;
        bytes32 voteRegisterParams; // The voting parameters for adding a GC.
        BoolVoteInterface boolVote; // The voting machine in which the voting takes place.
        mapping(bytes32=>GCProposal) proposals; // A mapping from the proposal ID to the proposal itself.
        mapping(address=>bytes32) removeParams; // A mapping that saves the parameters for removing each GC.
    }

    // A mapping from thr organization (Avatar) address to the saved data of the organization:
    mapping(address=>Organization) public organizations;

    // A mapping from hashes to parameters (use to store a particular configuration on the controller)
    struct Parameters {
        bytes32 voteRegisterParams;
        BoolVoteInterface boolVote;
    }
    mapping(bytes32=>Parameters) public parameters;

    function GlobalConstraintRegistrar(StandardToken _nativeToken, uint _fee, address _beneficiary) {
        updateParameters(_nativeToken, _fee, _beneficiary, bytes32(0));
    }

    /**
     * @dev hash the parameters, save them if necessary, and return the hash value
     */
    function setParameters(
        bytes32 _voteRegisterParams,
        BoolVoteInterface _boolVote
    ) returns(bytes32) {
        bytes32 paramsHash = getParametersHash(_voteRegisterParams, _boolVote);
        parameters[paramsHash].voteRegisterParams = _voteRegisterParams;
        parameters[paramsHash].boolVote = _boolVote;
        return paramsHash;
    }

    function getParametersHash(
        bytes32 _voteRegisterParams,
        BoolVoteInterface _boolVote
    ) constant returns(bytes32) {
        bytes32 paramsHash = (sha3(_voteRegisterParams, _boolVote));
        return paramsHash;
    }

    // Adding an organization to the universal scheme:
    // TODO: probably we want to define registerOrganization and isRegistered in UniversalScheme
    function registerOrganization(Avatar _avatar) {
      // Pay fees for using scheme:
      if (fee > 0) {
        nativeToken.transferFrom(_avatar, beneficiary, fee);
      }

      Organization memory org;
      org.isRegistered = true;
      organizations[_avatar] = org;
      LogOrgRegistered(_avatar);
    }

    function isRegistered(Avatar _avatar) constant returns(bool) {
      return organizations[_avatar].isRegistered;
    }

    /**
     * @dev propose to add a new global constraint:
     * @param _avatar the avatar of the organization that the constraint is proposed for
     * @param _gc the address of the global constraint that is being proposed
     * @param _params the parameters for the global contraint
     * @param _removeParams the conditions (on the voting machine) for removing this global constraint
     */
    // TODO: do some checks on _removeParams - it is very easy to make a mistake and not be able to remove the GC
    function proposeGlobalConstraint(Avatar _avatar, address _gc, bytes32 _params, bytes32 _removeParams) returns(bytes32) {
        require(isRegistered(_avatar)); // Check org is registered to use this universal scheme.
        Parameters memory votingParams = parameters[getParametersFromController(_avatar)];

        BoolVoteInterface boolVote = votingParams.boolVote;
        bytes32 proposalId = boolVote.propose(votingParams.voteRegisterParams, _avatar, ExecutableInterface(this));

        if (proposals[proposalId].proposalType != 0) {
          revert();
        }
        proposals[proposalId].proposalType = 1;
        proposals[proposalId].gc = _gc;
        proposals[proposalId].params = _params;
        proposals[proposalId].removeParams = _removeParams;
        boolVote.vote(proposalId, true, msg.sender); // Automatically votes `yes` in the name of the opener.
        LogNewProposal(proposalId);
        return proposalId;
    }

    // Proposing to remove a new GC:
    function proposeToRemoveGC(Avatar _avatar, address _gc) returns(bytes32) {
        Organization storage org = organizations[_avatar];
        Parameters memory params = parameters[getParametersFromController(_avatar)];
        require(org.isRegistered); // Check org is registred to use this universal scheme.
        BoolVoteInterface boolVote = params.boolVote;
        bytes32 proposalId = boolVote.propose(org.removeParams[_gc], _avatar, ExecutableInterface(this));
        if (proposals[proposalId].proposalType != 0) revert();
        proposals[proposalId].proposalType = 2;
        proposals[proposalId].gc = _gc;
        boolVote.vote(proposalId, true, msg.sender); // Automatically votes `yes` in the name of the opener.
        return proposalId;
    }

    /**
     * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
     * @param _proposalId the ID of the voting in the voting machine
     * @param _avatar address of the controller
     * @param _param a parameter of the voting result, 0 is no and 1 is yes.
     */
    function execute(bytes32 _proposalId, address _avatar, int _param) returns(bool) {
      // Check the caller is indeed the voting machine:
      require(parameters[getParametersFromController(Avatar(_avatar))].boolVote == msg.sender);

      // Check if vote was successful:
      if (_param != 1 ) {
        delete proposals[_proposalId];
        return true;
      }
      // Define controller and get the parmas:
      Controller controller = Controller(Avatar(_avatar).owner());
      GCProposal memory proposal = proposals[_proposalId];

      // Adding a GC
      if (proposal.proposalType == 1) {
          if (!controller.addGlobalConstraint(proposal.gc, proposal.params)) {
            revert();
          }
      }

      // Removing a GC
      if (proposal.proposalType == 2) {
          if (!controller.removeGlobalConstraint(proposal.gc)) {
            revert();
          }
      }
      delete proposals[_proposalId];
      return true;
    }
}
