pragma solidity ^0.5.2;

import "@daostack/infra/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra/contracts/votingMachines/ProposalExecuteInterface.sol";
import "./UniversalScheme.sol";
import "../votingMachines/VotingMachineCallbacks.sol";


/**
 * @title A scheme to manage the upgrade of an organization.
 * @dev The scheme is used to upgrade the controller of an organization to a new controller.
 */

contract UpgradeScheme is UniversalScheme, VotingMachineCallbacks, ProposalExecuteInterface {

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
        bytes32 _params,
        string _descriptionHash
    );

    event ProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId, int256 _param);
    event ProposalDeleted(address indexed _avatar, bytes32 indexed _proposalId);

    // Details of an upgrade proposal:
    struct UpgradeProposal {
        address upgradeContract; // Either the new controller we upgrade to, or the new upgrading scheme.
        bytes32 params; // Params for the new upgrading scheme.
        uint256 proposalType; // 1: Upgrade controller, 2: change upgrade scheme.
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
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _param a parameter of the voting result, 1 yes and 2 is no.
    */
    function executeProposal(bytes32 _proposalId, int256 _param) external onlyVotingMachine(_proposalId) returns(bool) {
        Avatar avatar = proposalsInfo[_proposalId].avatar;
        UpgradeProposal memory proposal = organizationsProposals[address(avatar)][_proposalId];
        require(proposal.proposalType != 0);
        delete organizationsProposals[address(avatar)][_proposalId];
        emit ProposalDeleted(address(avatar), _proposalId);
        // Check if vote was successful:
        if (_param == 1) {

        // Define controller and get the params:
            ControllerInterface controller = ControllerInterface(avatar.owner());
        // Upgrading controller:
            if (proposal.proposalType == 1) {
                require(controller.upgradeController(proposal.upgradeContract, avatar));
            }

        // Changing upgrade scheme:
            if (proposal.proposalType == 2) {
                bytes4 permissions = controller.getSchemePermissions(address(this), address(avatar));
                require(
                controller.registerScheme(proposal.upgradeContract, proposal.params, permissions, address(avatar))
                );
                if (proposal.upgradeContract != address(this)) {
                    require(controller.unregisterSelf(address(avatar)));
                }
            }
        }
        emit ProposalExecuted(address(avatar), _proposalId, _param);
        return true;
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
        return  (keccak256(abi.encodePacked(_voteParams, _intVote)));
    }

    /**
    * @dev propose an upgrade of the organization's controller
    * @param _avatar avatar of the organization
    * @param _newController address of the new controller that is being proposed
    * @param _descriptionHash proposal description hash
    * @return an id which represents the proposal
    */
    function proposeUpgrade(Avatar _avatar, address _newController, string memory _descriptionHash)
        public
        returns(bytes32)
    {
        Parameters memory params = parameters[getParametersFromController(_avatar)];
        bytes32 proposalId = params.intVote.propose(2, params.voteParams, msg.sender, address(_avatar));
        UpgradeProposal memory proposal = UpgradeProposal({
            proposalType: 1,
            upgradeContract: _newController,
            params: bytes32(0)
        });
        organizationsProposals[address(_avatar)][proposalId] = proposal;
        emit NewUpgradeProposal(
        address(_avatar),
        proposalId,
        address(params.intVote),
        _newController,
        _descriptionHash
        );
        proposalsInfo[proposalId] = ProposalInfo({
            blockNumber:block.number,
            avatar:_avatar,
            votingMachine:address(params.intVote)
        });
        return proposalId;
    }

    /**
    * @dev propose to replace this scheme by another upgrading scheme
    * @param _avatar avatar of the organization
    * @param _scheme address of the new upgrading scheme
    * @param _params the parameters of the new upgrading scheme
    * @param _descriptionHash proposal description hash
    * @return an id which represents the proposal
    */
    function proposeChangeUpgradingScheme(
        Avatar _avatar,
        address _scheme,
        bytes32 _params,
        string memory _descriptionHash
    )
        public
        returns(bytes32)
    {
        Parameters memory params = parameters[getParametersFromController(_avatar)];
        IntVoteInterface intVote = params.intVote;
        bytes32 proposalId = intVote.propose(2, params.voteParams, msg.sender, address(_avatar));
        require(organizationsProposals[address(_avatar)][proposalId].proposalType == 0);

        UpgradeProposal memory proposal = UpgradeProposal({
            proposalType: 2,
            upgradeContract: _scheme,
            params: _params
        });
        organizationsProposals[address(_avatar)][proposalId] = proposal;

        emit ChangeUpgradeSchemeProposal(
            address(_avatar),
            proposalId,
            address(params.intVote),
            _scheme,
            _params,
            _descriptionHash
        );
        proposalsInfo[proposalId] = ProposalInfo({
            blockNumber:block.number,
            avatar:_avatar,
            votingMachine:address(intVote)
        });
        return proposalId;
    }
}
