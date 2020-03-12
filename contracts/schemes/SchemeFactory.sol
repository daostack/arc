pragma solidity ^0.5.16;

import "@daostack/infra-experimental/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra-experimental/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "../votingMachines/VotingMachineCallbacks.sol";
import "../utils/DAOFactory.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";


/**
 * @title A factory and registrar for Schemes for organizations
 * @dev The SchemeFactory is used for deploying and registering schemes to organisations
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
        address _schemeToReplace,
        string _descriptionHash
    );

    event ProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId, int256 _param);
    event ProposalDeleted(address indexed _avatar, bytes32 indexed _proposalId);

    // a proposal to add or remove a scheme to/from the an organization
    struct Proposal {
        string schemeName;
        bytes schemeData;
        uint64[3] packageVersion;
        address schemeToReplace;
        bytes4 permissions;
    }

    mapping(bytes32=>Proposal) public proposals;

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
        Proposal memory proposal = proposals[_proposalId];
        delete proposals[_proposalId];
        emit ProposalDeleted(address(avatar), _proposalId);
        Controller controller = Controller(avatar.owner());
        if (_decision == 1) {
            if (bytes(proposal.schemeName).length > 0) {
                address scheme = address(daoFactory.createInstance(
                                        proposal.packageVersion,
                                        proposal.schemeName,
                                        address(avatar),
                                        proposal.schemeData));

                require(controller.registerScheme(scheme, proposal.permissions), "faild to register new scheme");
            }


            if (proposal.schemeToReplace != address(0) && controller.isSchemeRegistered(proposal.schemeToReplace)) {
                require(controller.unregisterScheme(proposal.schemeToReplace), "faild to unregister old scheme");
            }
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
    * @param _schemeToReplace address of scheme to replace with the new scheme (zero for none)
    * @param _descriptionHash proposal's description hash
    * @return a proposal Id
    */
    function proposeScheme(
        uint64[3] memory _packageVersion,
        string memory _schemeName,
        bytes memory _schemeData,
        bytes4 _permissions,
        address _schemeToReplace,
        string memory _descriptionHash
    )
    public
    returns(bytes32)
    {
        if (bytes(_schemeName).length > 0) {
            // propose
            require(
                daoFactory.getImplementation(_packageVersion, _schemeName) != address(0),
                "scheme name does not exist in ArcHive"
            );
        } else if (_schemeToReplace != address(0)) {
            Controller controller = Controller(avatar.owner());
            require(
                controller.isSchemeRegistered(_schemeToReplace),
                "scheme to replace is not registered in the organization"
            );
        } else {
            revert("proposal must have a scheme name to reister or address to unregister");
        }

        bytes32 proposalId = votingMachine.propose(
            2,
            voteParams,
            msg.sender,
            address(avatar)
        );

        Proposal memory proposal = Proposal({
            schemeName: _schemeName,
            schemeData: _schemeData,
            packageVersion: _packageVersion,
            schemeToReplace: _schemeToReplace,
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
            _schemeToReplace,
            _descriptionHash
        );

        proposals[proposalId] = proposal;
        proposalsInfo[address(votingMachine)][proposalId] = ProposalInfo({
            blockNumber:block.number,
            avatar:avatar
        });
        return proposalId;
    }
}
