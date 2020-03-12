pragma solidity ^0.5.16;

import "@daostack/infra-experimental/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra-experimental/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "../votingMachines/VotingMachineCallbacks.sol";
import "../utils/DAOFactory.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";


/**
 * @title A factory and registrar for Schemes for organizations
 * @dev The SchemeFactory is used for deploying and registering schemes at organizations
 */

contract SchemeFactory is Initializable, VotingMachineCallbacks, ProposalExecuteInterface {
    event NewSchemeProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        string _schemeName,
        bytes _schemeData,
        uint64[3] _packageVersion,
        bytes4 _permissions,
        string _descriptionHash
    );

    event ProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId, int256 _param);
    event ProposalDeleted(address indexed _avatar, bytes32 indexed _proposalId);

    // a SchemeProposal is a  proposal to add or remove a scheme to/from the an organization
    struct SchemeProposal {
        string schemeName;
        bytes schemeData;
        uint64[3] packageVersion;
        bytes4 permissions;
    }

    mapping(bytes32=>SchemeProposal) public organizationProposals;

    IntVoteInterface public votingMachine;
    bytes32 public voteParams;
    Avatar public avatar;
    DAOFactory public daoFactory;

    /**
     * @dev initialize
     * @param _avatar the avatar this scheme referring to.
     * @param _votingMachine the voting machines address to
     * @param _voteParams voting machine parameters to register scheme.
     */
    function initialize(
        Avatar _avatar,
        IntVoteInterface _votingMachine,
        bytes32 _voteParams,
        DAOFactory _daoFactory
    )
    external
    initializer
    {
        require(_avatar != Avatar(0), "avatar cannot be zero");
        avatar = _avatar;
        votingMachine = _votingMachine;
        voteParams = _voteParams;
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
        require(bytes(proposal.schemeName).length != 0);
        delete organizationProposals[_proposalId];
        emit ProposalDeleted(address(avatar), _proposalId);
        if (_decision == 1) {
            // Define controller and get the params:
            Controller controller = Controller(avatar.owner());

            address scheme = address(daoFactory.createInstance(
                                proposal.packageVersion,
                                proposal.schemeName,
                                address(avatar),
                                proposal.schemeData));

            require(controller.registerScheme(
                    scheme,
                    proposal.permissions)
            );
        }
        emit ProposalExecuted(address(avatar), _proposalId, _decision);
        return true;
    }

    /**
    * @dev create a proposal to register a scheme
    * @param _packageVersion the Arc version to use for deploying the scheme
    * @param _schemeName the name of the scheme to be added
    * @param _schemeData initialize data for the scheme to be added
    * @param _permissions the permission of the scheme to be registered
    * @param _descriptionHash proposal's description hash
    * @return a proposal Id
    * @dev NB: not only proposes the vote, but also votes for it
    */
    function proposeScheme(
        uint64[3] memory _packageVersion,
        string memory _schemeName,
        bytes memory _schemeData,
        bytes4 _permissions,
        string memory _descriptionHash
    )
    public
    returns(bytes32)
    {
        // propose
        require(daoFactory.getImplementation(_packageVersion, _schemeName) != address(0), "scheme name does not exist in Arc");

        bytes32 proposalId = votingMachine.propose(
            2,
            voteParams,
            msg.sender,
            address(avatar)
        );

        SchemeProposal memory proposal = SchemeProposal({
            schemeName: _schemeName,
            schemeData: _schemeData,
            packageVersion: _packageVersion,
            permissions: _permissions
        });

        emit NewSchemeProposal(
            address(avatar),
            proposalId,
            address(votingMachine),
            _schemeName,
            _schemeData,
            _packageVersion,
            _permissions,
            _descriptionHash
        );

        organizationProposals[proposalId] = proposal;
        proposalsInfo[address(votingMachine)][proposalId] = ProposalInfo({
            blockNumber:block.number,
            avatar:avatar
        });
        return proposalId;
    }
}
