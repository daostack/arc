pragma solidity 0.5.15;

import "@daostack/infra-experimental/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra-experimental/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "../votingMachines/VotingMachineCallbacks.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "../libs/DAOCallerHelper.sol";
import "../utils/DAOFactory.sol";

/**
 * @title A registrar for Schemes for organizations
 * @dev The SchemeRegistrar is used for registering and unregistering actors at organizations
 */

contract SchemeRegistrar is Initializable, VotingMachineCallbacks, ProposalExecuteInterface {
    using DAOCallerHelper for DAO;

    event NewSchemeProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        string _actorToRegister,
        address _actorToUnRegister,
        string _descriptionHash
    );

    event ProposalExecuted(address indexed _dao, bytes32 indexed _proposalId, int256 _param);
    event ProposalDeleted(address indexed _dao, bytes32 indexed _proposalId);

    // a SchemeProposal is a  proposal to add or remove a actor to/from the an organization
    struct SchemeProposal {
        string actorToRegister; //
        address actorToUnregister;
        uint64[3] packageVersion;
        bytes initilizeData;
    }

    mapping(bytes32=>SchemeProposal) public organizationProposals;

    IntVoteInterface public votingMachine;
    bytes32 public voteRegisterParams;
    bytes32 public voteRemoveParams;
    DAO public dao;
    DAOFactory public daoFactory;

    /**
     * @dev initialize
     * @param _dao the dao this actor referring to.
     * @param _votingMachine the voting machines address to
     * @param _voteRegisterParams voting machine parameters to register actor.
     * @param _voteRemoveParams voting machine parameters to remove actor.
     * @param _daoFactory daostack daoFactory contract.
     */
    function initialize(
        DAO _dao,
        IntVoteInterface _votingMachine,
        bytes32 _voteRegisterParams,
        bytes32 _voteRemoveParams,
        DAOFactory _daoFactory
    )
    external
    initializer
    {
        require(_dao != DAO(0), "dao cannot be zero");
        dao = _dao;
        votingMachine = _votingMachine;
        voteRegisterParams = _voteRegisterParams;
        voteRemoveParams = _voteRemoveParams;
        daoFactory = _daoFactory;
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _decision the voting result, 1 yes and 2 is no.
    */
    function executeProposal(bytes32 _proposalId, int256 _decision)
    external
    onlyVotingMachine(_proposalId)
    returns(bool) {
        SchemeProposal memory proposal = organizationProposals[_proposalId];
        delete organizationProposals[_proposalId];
        emit ProposalDeleted(address(dao), _proposalId);
        if (_decision == 1) {
          // Add a actor:
            bytes memory tempEmptyStringTest = bytes(proposal.actorToRegister); // Uses memory
            if (tempEmptyStringTest.length != 0) {
                address actorInstance = address(daoFactory.createInstance(proposal.packageVersion,
                                                proposal.actorToRegister,
                                                address(dao),
                                                proposal.initilizeData));
                dao.registerActor(actorInstance);
            }
          // Remove a actor:
            if (proposal.actorToUnregister != address(0)) {
                dao.unRegisterActor(proposal.actorToUnregister);
            }
        }
        emit ProposalExecuted(address(dao), _proposalId, _decision);
        return true;
    }

    /**
    * @dev create a proposal to register a actor
    * @param _actorToRegister the actor's name to be registered
    * @param _actorToUnRegister the actor's name to be unregistered
    * @param _descriptionHash proposal's description hash
    * @return a proposal Id
    * @dev NB: not only proposes the vote, but also votes for it
    */
    function proposeScheme(
        string memory _actorToRegister,
        address _actorToUnRegister,
        string memory _descriptionHash,
        uint64[3] memory _packageVersion,
        bytes memory _initilizeData
    )
    public
    returns(bytes32)
    {
        bytes memory tempEmptyStringTest = bytes(_actorToRegister); // Uses memory
        require(tempEmptyStringTest.length != 0 || _actorToUnRegister != address(0),
        "actor to register or unregister cannot be zero");

        bytes32 proposalId = votingMachine.propose(
            2,
            voteRegisterParams,
            msg.sender,
            address(dao)
        );

        uint64[3] memory packageVersion;
        if (_packageVersion[0] == 0 && _packageVersion[1] == 0 && _packageVersion[2] == 0) {
            packageVersion = daoFactory.getLatestPackageVersion();
        } else {
            packageVersion = _packageVersion;
        }

        SchemeProposal memory proposal = SchemeProposal({
            actorToRegister: _actorToRegister,
            actorToUnregister: _actorToUnRegister,
            packageVersion: packageVersion,
            initilizeData: _initilizeData
        });
        emit NewSchemeProposal(
            address(dao),
            proposalId,
            address(votingMachine),
            _actorToRegister,
            _actorToUnRegister,
            _descriptionHash
        );
        organizationProposals[proposalId] = proposal;
        proposalsInfo[address(votingMachine)][proposalId] = ProposalInfo({
            blockNumber:block.number,
            dao:dao
        });
        return proposalId;
    }
}
