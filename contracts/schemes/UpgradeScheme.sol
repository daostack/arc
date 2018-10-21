pragma solidity ^0.4.24;

import "@daostack/infra/contracts/VotingMachines/GenesisProtocolExecuteInterface.sol";

import "../controller/ControllerInterface.sol";
import "../controller/Avatar.sol";
import "../VotingMachines/GenesisProtocolCallbacks.sol";


/**
 * @title A scheme to manage the upgrade of an organization.
 * @dev The scheme is used to upgrade the controller of an organization to a new controller.
 */
contract UpgradeScheme is GenesisProtocolCallbacks, GenesisProtocolExecuteInterface {
    event NewUpgradeProposal(
        bytes32 indexed _proposalId,
        address _newController
    );
    event ChangeUpgradeSchemeProposal(
        bytes32 indexed _proposalId,
        address _newUpgradeScheme,
        bytes32 _params
    );
    event ProposalExecuted(bytes32 indexed _proposalId, int _param);
    event ProposalDeleted(bytes32 indexed _proposalId);

    // Details of an upgrade proposal:
    struct UpgradeProposal {
        address upgradeContract; // Either the new controller we upgrade to, or the new upgrading scheme.
        bytes32 params; // Params for the new upgrading scheme.
        uint proposalType; // 1: Upgrade controller, 2: change upgrade scheme.
    }

    mapping(bytes32 => UpgradeProposal) public organizationProposals;

    IntVoteInterface public intVote;
    bytes32 public voteParams;
    Avatar public avatar;

    constructor () public {
        avatar = Avatar(0x000000000000000000000000000000000000dead);
    }

    function init(
        Avatar _avatar,
        IntVoteInterface _intVote,
        bytes32 _voteParams
    ) external
    {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");

        avatar = _avatar;
        intVote = _intVote;
        voteParams = _voteParams;
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _param a parameter of the voting result, 1 yes and 2 is no.
    */
    function executeProposal(bytes32 _proposalId, int _param) external onlyVotingMachine(_proposalId) returns(bool) {
        UpgradeProposal memory proposal = organizationProposals[_proposalId];

        require(proposal.proposalType != 0, "Proposal doesn't exist");

        delete organizationProposals[_proposalId];

        emit ProposalDeleted(_proposalId);

        // Check if vote was successful:
        if (_param == 1) {
            // Define controller and get the params:
            ControllerInterface controller = ControllerInterface(Avatar(avatar).owner());
        
            // Upgrading controller:
            if (proposal.proposalType == 1) {
                require(controller.upgradeController(proposal.upgradeContract, avatar), "Failed to upgrade controller");
            }

            // Changing upgrade scheme:
            if (proposal.proposalType == 2) {
                bytes4 permissions = controller.getSchemePermissions(this,avatar);

                require(controller.registerScheme(proposal.upgradeContract, proposal.params, permissions, avatar), "Failed to change upgrade scheme");
                
                if (proposal.upgradeContract != address(this) ) {
                    require(controller.unregisterSelf(avatar), "Failed to remove old upgrade scheme");
                }
            }
        }

        emit ProposalExecuted(_proposalId, _param);

        return true;
    }

    /**
    * @dev propose an upgrade of the organization's controller
    * @param _newController address of the new controller that is being proposed
    * @return an id which represents the proposal
    */
    function proposeUpgrade(address _newController)
        public
        returns(bytes32)
    {
        bytes32 proposalId = intVote.propose(2, voteParams, msg.sender);
        
        UpgradeProposal memory proposal = UpgradeProposal({
            proposalType: 1,
            upgradeContract: _newController,
            params: bytes32(0)
        });

        organizationProposals[proposalId] = proposal;
        
        emit NewUpgradeProposal(proposalId, _newController);
        
        proposalsInfo[proposalId] = ProposalInfo({
            blockNumber: block.number,
            avatar: avatar,
            votingMachine: intVote
        });

        intVote.ownerVote(proposalId, 1, msg.sender); // Automatically votes `yes` in the name of the proposal submitter.*/
        
        return proposalId;
    }

    /**
    * @dev propose to replace this scheme by another upgrading scheme
    * @param _scheme address of the new upgrading scheme
    * @param _params ???
    * @return an id which represents the proposal
    */
    function proposeChangeUpgradingScheme(
        address _scheme,
        bytes32 _params
    )
        public
        returns(bytes32)
    {
        bytes32 proposalId = intVote.propose(2, voteParams, msg.sender);
        require(organizationProposals[proposalId].proposalType == 0, "Proposal already exists");

        UpgradeProposal memory proposal = UpgradeProposal({
            proposalType: 2,
            upgradeContract: _scheme,
            params: _params
        });

        organizationProposals[proposalId] = proposal;

        emit ChangeUpgradeSchemeProposal(
            proposalId,
            _scheme,
            _params
        );

        proposalsInfo[proposalId] = ProposalInfo({
            blockNumber: block.number,
            avatar: avatar,
            votingMachine: intVote
        });

        intVote.ownerVote(proposalId, 1, msg.sender); // Automatically votes `yes` in the name of the opener.
        
        return proposalId;
    }
}
