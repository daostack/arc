pragma solidity ^0.5.17;

import "@daostack/infra-experimental/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra-experimental/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "../votingMachines/VotingMachineCallbacks.sol";
import "../utils/DAOFactory.sol";


/**
 * @title A factory and registrar for Schemes for organizations
 * @dev The SchemeFactory is used for deploying and registering schemes to organisations
 */
contract SchemeFactory is VotingMachineCallbacks, ProposalExecuteInterface {
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

    DAOFactory public daoFactory;

    /**
     * @dev initialize
     * @param _avatar the avatar this scheme referring to.
     * @param _votingMachine the voting machines address to
     * @param _votingParams genesisProtocol parameters - valid only if _voteParamsHash is zero
     * @param _voteOnBehalf genesisProtocol parameter - valid only if _voteParamsHash is zero
     * @param _voteParamsHash voting machine parameters to register scheme.
     * @param _daoFactory daoFactory contract
     */
    function initialize(
        Avatar _avatar,
        IntVoteInterface _votingMachine,
        uint256[11] calldata _votingParams,
        address _voteOnBehalf,
        bytes32 _voteParamsHash,
        DAOFactory _daoFactory
    )
    external
    {
        super._initializeGovernance(_avatar, _votingMachine, _voteParamsHash, _votingParams, _voteOnBehalf);
        daoFactory = _daoFactory;
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _decision the voting result, 1 yes and 2 is no.
    * @return true (if function did not revert)
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
            voteParamsHash,
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
        proposalsBlockNumber[proposalId] = block.number;
        return proposalId;
    }
}
