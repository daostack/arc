pragma solidity 0.5.15;

import "@daostack/infra-experimental/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra-experimental/contracts/votingMachines/ProposalExecuteInterface.sol";
import "../votingMachines/VotingMachineCallbacks.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "../utils/DAOFactory.sol";

/**
 * @title A scheme to manage the upgrade of an organization.
 * @dev The scheme is used to upgrade the controller of an organization to a new controller.
 */

contract UpgradeScheme is Initializable, VotingMachineCallbacks, ProposalExecuteInterface {

    event NewUpgradeProposal(
        address indexed _dao,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        address _newController,
        string _descriptionHash
    );

    event ChangeUpgradeSchemeProposal(
        address indexed _dao,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        address _newUpgradeScheme,
        string _descriptionHash
    );

    event ProposalExecuted(address indexed _dao, bytes32 indexed _proposalId, int256 _param);
    event ProposalDeleted(address indexed _dao, bytes32 indexed _proposalId);

    // Details of an upgrade proposal:
    struct UpgradeProposal {
        address newDAOImplementation;
    }

    mapping(bytes32=>UpgradeProposal) public organizationProposals;

    IntVoteInterface public votingMachine;
    bytes32 public voteParams;
    DAO public dao;
    DAOFactory public daoFactory;

    /**
     * @dev initialize
     * @param _dao the dao this scheme referring to.
     * @param _votingMachine the voting machines address to
     * @param _voteParams voting machine parameters.
     */
    function initialize(
        DAO _dao,
        IntVoteInterface _votingMachine,
        bytes32 _voteParams,
        DAOFactory _daoFactory
    )
    external
    initializer
    {
        require(_dao != DAO(0), "dao cannot be zero");
        dao = _dao;
        votingMachine = _votingMachine;
        voteParams = _voteParams;
        daoFactory = _daoFactory;
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _param a parameter of the voting result, 1 yes and 2 is no.
    */
    function executeProposal(bytes32 _proposalId, int256 _param) external onlyVotingMachine(_proposalId) returns(bool) {
        UpgradeProposal memory proposal = organizationProposals[_proposalId];
        delete organizationProposals[_proposalId];
        emit ProposalDeleted(address(dao), _proposalId);
        // Check if vote was successful:
        if (_param == 1) {
            dao.upgradeDAO(proposal.newDAOImplementation);
        }
        emit ProposalExecuted(address(dao), _proposalId, _param);
        return true;
    }

    /**
    * @dev propose an upgrade of the organization's controller
    * @param _packageVersion the package version to upgrade the dao implemention from.
    * @param _descriptionHash proposal description hash
    * @return an id which represents the proposal
    */
    function proposeUpgrade(uint64[3] memory _packageVersion, string memory _descriptionHash)
        public
        returns(bytes32)
    {
        bytes32 proposalId = votingMachine.propose(2, voteParams, msg.sender, address(dao));
        address newDAOImplementation = daoFactory.getImplementation("DAO", _packageVersion);
        organizationProposals[proposalId].newDAOImplementation = newDAOImplementation;
        emit NewUpgradeProposal(
        address(dao),
        proposalId,
        address(votingMachine),
        newDAOImplementation,
        _descriptionHash
        );
        proposalsInfo[address(votingMachine)][proposalId] = ProposalInfo({
            blockNumber:block.number,
            dao:dao
        });
        return proposalId;
    }
}
