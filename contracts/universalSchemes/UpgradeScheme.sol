pragma solidity ^0.4.11;

import "../controller/Controller.sol";
import "../VotingMachines/BoolVoteInterface.sol";
import "./UniversalScheme.sol";

/**
 * @title A schme to manage the upgrade of an organization.
 * @dev The schme is used to upgrade the controller of an organization to a new controller.
 */

contract UpgradeScheme is UniversalScheme {
    // Details of an upgrade proposal:
    struct UpgradeProposal {
      address newContOrScheme;
      bytes32 params;
      uint proposalType; // 1: Upgrade controller, 2: change upgrade scheme.
      StandardToken tokenFee;
      uint fee;
    }

    // Struct holding the data for each organization
    struct Organization {
      bool isRegistered;
      bytes32 voteParams;
      BoolVoteInterface boolVote;
      mapping(bytes32=>UpgradeProposal) proposals;
    }

    // A mapping from thr organization (Avatar) address to the saved data of the organization:
    mapping(address=>Organization) organizations;

    // A mapping from hashes to parameters (use to store a particular configuration on the controller)
    struct Parameters {
        bytes32 voteParams;
        BoolVoteInterface boolVote;
    }
    mapping(bytes32=>Parameters) parameters;


    // Constructor, updating the initial prarmeters:
    function UpgradeScheme(StandardToken _nativeToken, uint _fee, address _beneficiary) {
        updateParameters(_nativeToken, _fee, _beneficiary, bytes32(0));
    }

    // The format of the hashing of the parameters:
    function parametersHash(
        bytes32 _voteParams,
        BoolVoteInterface _boolVote
        ) constant returns(bytes32) {
        return (sha3(_voteParams, _boolVote));
    }

    // Check that the parameters listed match the ones in the controller:
    function checkParameterHashMatch(Avatar _avatar, bytes32 _voteParams,
                     BoolVoteInterface _boolVote) constant returns(bool) {
       Controller controller = Controller(_avatar.owner());
       return (controller.getSchemeParameters(this) == parametersHash(_voteParams, _boolVote));
    }

    // Adding an organization to the universal scheme:
    function addOrUpdateOrg(Avatar _avatar, bytes32 _voteParams, BoolVoteInterface _boolVote) {

      // Pay fees for using scheme:
      nativeToken.transferFrom(_avatar, beneficiary, fee);

      /*require(_controller.upgradingScheme() == address(this));*/ // No need, execution will just fail.
      require(checkParameterHashMatch(_avatar, _voteParams, _boolVote));
      Organization memory org;
      org.isRegistered = true;
      org.voteParams = _voteParams;
      org.boolVote = _boolVote;
      organizations[_avatar] = org;
    }

    // Propose an upgrade of the controller:
    function proposeUpgrade(Avatar _avatar, address _newController) returns(bytes32) {
        Organization org = organizations[_avatar];
        require(org.isRegistered); // Check org is registred to use this universal scheme.
        require(checkParameterHashMatch(_avatar, org.voteParams, org.boolVote));
        BoolVoteInterface boolVote = org.boolVote;
        bytes32 id = boolVote.propose(org.voteParams);
        if (org.proposals[id].proposalType != 0) revert();
        org.proposals[id].proposalType = 1;
        org.proposals[id].newContOrScheme = _newController;
        voteScheme(_avatar, id, true);
        return id;
    }

    // Propose to replace this schme by another upgrading schme:
    function proposeChangeUpgradingScheme(
        Avatar _avatar,
        address _scheme,
        bytes32 _params,
        StandardToken _tokenFee,
        uint _fee
    )
        returns(bytes32)
    {
        Organization org = organizations[_avatar];
        require(org.isRegistered); // Check org is registred to use this universal scheme.
        require(checkParameterHashMatch(_avatar, org.voteParams, org.boolVote));
        BoolVoteInterface boolVote = org.boolVote;
        bytes32 id = boolVote.propose(org.voteParams);
        if (org.proposals[id].proposalType != 0) revert();
        org.proposals[id].proposalType = 2;
        org.proposals[id].newContOrScheme = _scheme;
        org.proposals[id].params = _params;
        org.proposals[id].tokenFee = _tokenFee;
        org.proposals[id].fee = _fee;
        voteScheme(_avatar, id, true);
        return id;
    }

    // Vote on one of the proposals, also handles execution:
    function voteScheme( Avatar _avatar, bytes32 id, bool _yes ) returns(bool) {
        BoolVoteInterface boolVote = organizations[_avatar].boolVote;
        if( ! boolVote.vote(id, _yes, msg.sender) ) return false;
        if( boolVote.voteResults(id) ) {
            UpgradeProposal memory proposal = organizations[_avatar].proposals[id];
            if( ! boolVote.cancelProposal(id) ) revert();
            Controller controller = Controller(_avatar.owner());
            if( organizations[_avatar].proposals[id].proposalType == 2 ) {
                bytes4 permissions = controller.getSchemePermissions(this);
                if (proposal.fee != 0 )
                  if (!controller.externalTokenApprove(proposal.tokenFee, proposal.newContOrScheme, proposal.fee)) revert();
                if( ! controller.registerScheme(proposal.newContOrScheme, proposal.params, permissions) ) revert();
                if( ! controller.unregisterSelf() ) revert();
            }
              if( organizations[_avatar].proposals[id].proposalType == 1 ) {
                  if( ! controller.upgradeController(proposal.newContOrScheme) ) revert();
            }
            organizations[_avatar].proposals[id].proposalType = 0;
        }
    }

    function getVoteStatus(Avatar _avatar, bytes32 id) constant returns(uint[3]) {
        BoolVoteInterface boolVote = organizations[_avatar].boolVote;
        return (boolVote.voteStatus(id));
    }
}
