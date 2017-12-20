pragma solidity ^0.4.18;

import "../VotingMachines/IntVoteInterface.sol";
import "./UniversalScheme.sol";


/**
 * @title A schme to manage the upgrade of an organization.
 * @dev The schme is used to upgrade the controller of an organization to a new controller.
 */

contract UpgradeScheme is UniversalScheme, ExecutableInterface {
    event LogNewUpgradeProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        address _newController
    );
    event LogChangeUpgradeSchemeProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        address newUpgradeScheme,
        bytes32 _params,
        StandardToken tokenFee,
        uint fee
    );
    event LogProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId);
    event LogProposalDeleted(address indexed _avatar, bytes32 indexed _proposalId);

    // Details of an upgrade proposal:
    struct UpgradeProposal {
        address upgradeContract; // Either the new conroller we upgrade to, or the new upgrading scheme.
        bytes32 params; // Params for the new upgrading scheme.
        uint proposalType; // 1: Upgrade controller, 2: change upgrade scheme.
        StandardToken tokenFee;
        uint fee;
    }

    // A mapping from the organization's (Avatar) address to the saved data of the organization:
    mapping(address=>mapping(bytes32=>UpgradeProposal)) public organizationsProposals;

    // A mapping from hashes to parameters (use to store a particular configuration on the controller)
    struct Parameters {
        bytes32 voteParams;
        IntVoteInterface intVote;
    }

    mapping(bytes32=>Parameters) public parameters;

    /**
    * @dev the constructor takes a token address, fee and beneficiary
    */
    function UpgradeScheme(StandardToken _nativeToken, uint _fee, address _beneficiary) public {
        updateParameters(_nativeToken, _fee, _beneficiary, bytes32(0));
    }

    /**
    * @dev hash the parameters, save them if necessary, and return the hash value
    */
    function setParameters(
        bytes32 _voteParams,
        IntVoteInterface _intVote
    ) public returns(bytes32)
    {
        bytes32 paramsHash = getParametersHash(_voteParams, _intVote);
        parameters[paramsHash].voteParams = _voteParams;
        parameters[paramsHash].intVote = _intVote;
        return paramsHash;
    }

    /**
    * @dev return a hash of the given parameters
    */
    function getParametersHash(
        bytes32 _voteParams,
        IntVoteInterface _intVote
    ) public pure returns(bytes32)
    {
        return  (keccak256(_voteParams, _intVote));
    }

    /**
    * @dev porpose an upgrade of the organization's controller
    * @param _avatar avatar of the organization
    * @param _newController address of the new controller that is being porposed
    * @return an id which represents the porposal
    */
    function proposeUpgrade(Avatar _avatar, address _newController)
        public
        onlyRegisteredOrganization(_avatar)
        returns(bytes32)
    {
        Parameters memory params = parameters[getParametersFromController(_avatar)];
        bytes32 proposalId = params.intVote.propose(2, params.voteParams, _avatar, ExecutableInterface(this));
        if (organizationsProposals[_avatar][proposalId].proposalType != 0) {
            revert();
        }
        organizationsProposals[_avatar][proposalId].proposalType = 1;
        organizationsProposals[_avatar][proposalId].upgradeContract = _newController;
        LogNewUpgradeProposal(_avatar, proposalId, params.intVote, _newController);
        params.intVote.ownerVote(proposalId, 1, msg.sender); // Automatically votes `yes` in the name of the proposal submitter.*/
        return proposalId;
    }

    /**
    * @dev porpose to replace this scheme by another upgrading scheme
    * @param _avatar avatar of the organization
    * @param _scheme address of the new upgrading scheme
    * @param _params ???
    * @param _tokenFee  ???
    * @param _fee ???
    * @return an id which represents the porposal
    */
    function proposeChangeUpgradingScheme(
        Avatar _avatar,
        address _scheme,
        bytes32 _params,
        StandardToken _tokenFee,
        uint _fee
    )
        public
        onlyRegisteredOrganization(_avatar)
        returns(bytes32)
    {
        Parameters memory params = parameters[getParametersFromController(_avatar)];
        IntVoteInterface intVote = params.intVote;
        bytes32 proposalId = intVote.propose(2, params.voteParams, _avatar, ExecutableInterface(this));
        if (organizationsProposals[_avatar][proposalId].proposalType != 0) {
            revert();
        }

        UpgradeProposal memory proposal = UpgradeProposal({
            proposalType: 2,
            upgradeContract: _scheme,
            params: _params,
            tokenFee: _tokenFee,
            fee: _fee
        });
        organizationsProposals[_avatar][proposalId] = proposal;

        LogChangeUpgradeSchemeProposal(
            _avatar,
            proposalId,
            params.intVote,
            _scheme,
            _params,
            _tokenFee,
            _fee
        );
        intVote.ownerVote(proposalId, 1, msg.sender); // Automatically votes `yes` in the name of the opener.
        return proposalId;
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _avatar address of the controller
    * @param _param a parameter of the voting result, 0 is no and 1 is yes.
    */
    function execute(bytes32 _proposalId, address _avatar, int _param) public returns(bool) {
        // Check the caller is indeed the voting machine:
        require(parameters[getParametersFromController(Avatar(_avatar))].intVote == msg.sender);
        // Check if vote was successful:
        if (_param == 1) {

        // Define controller and get the parmas:
            Controller controller = Controller(Avatar(_avatar).owner());
            UpgradeProposal memory proposal = organizationsProposals[_avatar][_proposalId];

        // Upgrading controller:
            if (proposal.proposalType == 1) {
                if (!controller.upgradeController(proposal.upgradeContract)) {
                    revert();
                  }
                }

        // Changing upgrade scheme:
            if (proposal.proposalType == 2) {
                bytes4 permissions = controller.getSchemePermissions(this);
                if (proposal.fee != 0) {
                    if (!controller.externalTokenIncreaseApproval(proposal.tokenFee, proposal.upgradeContract, proposal.fee)) {
                        revert();
                      }
                    }
                if (!controller.registerScheme(proposal.upgradeContract, proposal.params, permissions)) {
                    revert();
                  }
                if (proposal.upgradeContract != address(this) ) {
                    if (!controller.unregisterSelf()) {
                        revert();
                      }
                    }
                  }
                }
        delete organizationsProposals[_avatar][_proposalId];
        return true;
    }
}
