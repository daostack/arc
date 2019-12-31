pragma solidity 0.5.15;

import "@daostack/infra-experimental/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra-experimental/contracts/votingMachines/ProposalExecuteInterface.sol";
import "../votingMachines/VotingMachineCallbacks.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";

/**
 * @title A scheme to manage the upgrade of an organization.
 * @dev The scheme is used to upgrade the controller of an organization to a new controller.
 */

contract UpgradeScheme is Initializable, VotingMachineCallbacks, ProposalExecuteInterface {

    event NewUpgradeProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        address _newController,
        string _descriptionHash
    );

    event ChangeUpgradeSchemeProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        address _newUpgradeScheme,
        string _descriptionHash
    );

    event ProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId, int256 _param);
    event ProposalDeleted(address indexed _avatar, bytes32 indexed _proposalId);

    // Details of an upgrade proposal:
    struct UpgradeProposal {
        address upgradeContract; // Either the new controller we upgrade to, or the new upgrading scheme.
        uint256 proposalType; // 1: Upgrade controller, 2: change upgrade scheme.
    }

    mapping(bytes32=>UpgradeProposal) public organizationProposals;

    IntVoteInterface public votingMachine;
    bytes32 public voteParams;
    DAO public avatar;

    /**
     * @dev initialize
     * @param _avatar the avatar this scheme referring to.
     * @param _votingMachine the voting machines address to
     * @param _voteParams voting machine parameters.
     */
    function initialize(
        DAO _avatar,
        IntVoteInterface _votingMachine,
        bytes32 _voteParams
    )
    external
    initializer
    {
        require(_avatar != DAO(0), "avatar cannot be zero");
        avatar = _avatar;
        votingMachine = _votingMachine;
        voteParams = _voteParams;
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _param a parameter of the voting result, 1 yes and 2 is no.
    */
    function executeProposal(bytes32 _proposalId, int256 _param) external onlyVotingMachine(_proposalId) returns(bool) {
        UpgradeProposal memory proposal = organizationProposals[_proposalId];
        require(proposal.proposalType != 0);
        delete organizationProposals[_proposalId];
        emit ProposalDeleted(address(avatar), _proposalId);
        // Check if vote was successful:
        if (_param == 1) {

        // Define controller and get the params:
            Controller controller = Controller(avatar.owner());
        // Upgrading controller:
            if (proposal.proposalType == 1) {
                require(controller.upgradeController(proposal.upgradeContract));
            }

        // Changing upgrade scheme:
            if (proposal.proposalType == 2) {
                bytes4 permissions = controller.schemesPermissions(address(this));
                require(
                controller.registerScheme(proposal.upgradeContract, permissions)
                );
                if (proposal.upgradeContract != address(this)) {
                    require(controller.unregisterSelf());
                }
            }
        }
        emit ProposalExecuted(address(avatar), _proposalId, _param);
        return true;
    }

    /**
    * @dev propose an upgrade of the organization's controller
    * @param _newController address of the new controller that is being proposed
    * @param _descriptionHash proposal description hash
    * @return an id which represents the proposal
    */
    function proposeUpgrade(address _newController, string memory _descriptionHash)
        public
        returns(bytes32)
    {
        bytes32 proposalId = votingMachine.propose(2, voteParams, msg.sender, address(avatar));
        UpgradeProposal memory proposal = UpgradeProposal({
            proposalType: 1,
            upgradeContract: _newController
        });
        organizationProposals[proposalId] = proposal;
        emit NewUpgradeProposal(
        address(avatar),
        proposalId,
        address(votingMachine),
        _newController,
        _descriptionHash
        );
        proposalsInfo[address(votingMachine)][proposalId] = ProposalInfo({
            blockNumber:block.number,
            avatar:avatar
        });
        return proposalId;
    }

    /**
    * @dev propose to replace this scheme by another upgrading scheme
    * @param _scheme address of the new upgrading scheme
    * @param _descriptionHash proposal description hash
    * @return an id which represents the proposal
    */
    function proposeChangeUpgradingScheme(
        address _scheme,
        string memory _descriptionHash
    )
        public
        returns(bytes32)
    {
        bytes32 proposalId = votingMachine.propose(2, voteParams, msg.sender, address(avatar));
        require(organizationProposals[proposalId].proposalType == 0);

        UpgradeProposal memory proposal = UpgradeProposal({
            proposalType: 2,
            upgradeContract: _scheme
        });
        organizationProposals[proposalId] = proposal;

        emit ChangeUpgradeSchemeProposal(
            address(avatar),
            proposalId,
            address(votingMachine),
            _scheme,
            _descriptionHash
        );
        proposalsInfo[address(votingMachine)][proposalId] = ProposalInfo({
            blockNumber:block.number,
            avatar:avatar
        });
        return proposalId;
    }
}
