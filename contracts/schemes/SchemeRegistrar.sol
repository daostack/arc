pragma solidity ^0.5.17;

import "@daostack/infra-experimental/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "../votingMachines/VotingMachineCallbacks.sol";


/**
 * @title A registrar for Schemes for organizations
 * @dev The SchemeRegistrar is used for registering and unregistering schemes at organizations
 */
contract SchemeRegistrar is VotingMachineCallbacks, ProposalExecuteInterface {
    event NewSchemeProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        address _scheme,
        bytes4 _permissions,
        string _descriptionHash
    );

    event RemoveSchemeProposal(address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        address _scheme,
        string _descriptionHash
    );

    event ProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId, int256 _param);
    event ProposalDeleted(address indexed _avatar, bytes32 indexed _proposalId);

    // a SchemeProposal is a  proposal to add or remove a scheme to/from the an organization
    struct SchemeProposal {
        address scheme; //
        bool addScheme; // true: add a scheme, false: remove a scheme.
        bytes4 permissions;
    }

    mapping(bytes32=>SchemeProposal) public organizationProposals;

    bytes32 public voteRegisterParamsHash;
    bytes32 public voteRemoveParamsHash;

    /**
     * @dev initialize
     * @param _avatar the avatar this scheme referring to.
     * @param _votingParams genesisProtocol parameters
     * @param _addresses array of addresses
     *       addresses[0] - _daoFactory DAOFactory instance to instance a votingMachine.
     *       addresses[1] - _voteOnBehalf  parameter
     *       addresses[2] - _organization organization
     *       addresses[3] - _callbacks should fulfill voting callbacks interface
     *       addresses[4] - _authorizedToPropose only this address allow to propose (unless it is zero)
     *       addresses[5] - _stakingToken (for GenesisProtocol)
     * @param _packageVersion packageVersion to instance the votingMachine from.
     * @param _votingMachineName the votingMachine contract name.
     */
    function initialize(
        Avatar _avatar,
        uint256[11] calldata _votingParams,
        address[6] calldata _addresses,
        uint64[3] calldata _packageVersion,
        string calldata _votingMachineName
    )
    external
    {
        super._initializeGovernance(_avatar, _votingParams, _addresses, _packageVersion, _votingMachineName);
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
        require(proposal.scheme != address(0));
        delete organizationProposals[_proposalId];
        emit ProposalDeleted(address(avatar), _proposalId);
        if (_decision == 1) {

          // Define controller and get the params:
            Controller controller = Controller(avatar.owner());

          // Add a scheme:
            if (proposal.addScheme) {
                require(controller.registerScheme(
                        proposal.scheme,
                        proposal.permissions)
                );
            }
          // Remove a scheme:
            if (!proposal.addScheme) {
                require(controller.unregisterScheme(proposal.scheme));
            }
        }
        emit ProposalExecuted(address(avatar), _proposalId, _decision);
        return true;
    }

    /**
    * @dev create a proposal to register a scheme
    * @param _scheme the address of the scheme to be registered
    * @param _permissions the permission of the scheme to be registered
    * @param _descriptionHash proposal's description hash
    * @return a proposal Id
    * @dev NB: not only proposes the vote, but also votes for it
    */
    function proposeScheme(
        address _scheme,
        bytes4 _permissions,
        string memory _descriptionHash
    )
    public
    returns(bytes32)
    {
        // propose
        require(_scheme != address(0), "scheme cannot be zero");

        bytes32 proposalId = votingMachine.propose(
            2,
            voteRegisterParamsHash,
            msg.sender,
            address(avatar)
        );

        SchemeProposal memory proposal = SchemeProposal({
            scheme: _scheme,
            addScheme: true,
            permissions: _permissions
        });
        emit NewSchemeProposal(
            address(avatar),
            proposalId,
            address(votingMachine),
            _scheme,
            _permissions,
            _descriptionHash
        );
        organizationProposals[proposalId] = proposal;
        proposalsBlockNumber[proposalId] = block.number;
        return proposalId;
    }

    /**
    * @dev propose to remove a scheme for a controller
    * @param _scheme the address of the scheme we want to remove
    * @param _descriptionHash proposal description hash
    * NB: not only registers the proposal, but also votes for it
    */
    function proposeToRemoveScheme(address _scheme, string memory _descriptionHash)
    public
    returns(bytes32)
    {
        require(_scheme != address(0), "scheme cannot be zero");

        bytes32 proposalId = votingMachine.propose(2, voteRemoveParamsHash, msg.sender, address(avatar));
        organizationProposals[proposalId].scheme = _scheme;
        emit RemoveSchemeProposal(address(avatar), proposalId, address(votingMachine), _scheme, _descriptionHash);
        proposalsBlockNumber[proposalId] = block.number;
        return proposalId;
    }
}
