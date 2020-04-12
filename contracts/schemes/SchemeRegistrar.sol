pragma solidity ^0.5.16;

import "@daostack/infra-experimental/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra-experimental/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "../votingMachines/VotingMachineCallbacks.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";


/**
 * @title A registrar for Schemes for organizations
 * @dev The SchemeRegistrar is used for registering and unregistering schemes at organizations
 */
contract SchemeRegistrar is Initializable, VotingMachineCallbacks, ProposalExecuteInterface {
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

    IntVoteInterface public votingMachine;
    bytes32 public voteRegisterParamsHash;
    bytes32 public voteRemoveParamsHash;
    Avatar public avatar;

    /**
     * @dev initialize
     * @param _avatar the avatar this scheme referring to.
     * @param _votingMachine the voting machines address to
     * @param _votingParamsRegister genesisProtocol parameters - valid only if _voteParamsHash is zero
     * @param _voteOnBehalfRegister genesisProtocol parameter - valid only if _voteParamsHash is zero
     * @param _voteRegisterParamsHash voting machine parameters to register scheme.
     * @param _votingParamsRemove genesisProtocol parameters - valid only if _voteParamsHash is zero
     * @param _voteOnBehalfRemove genesisProtocol parameter - valid only if _voteParamsHash is zero
     * @param _voteRemoveParamsHash voting machine parameters to remove scheme.
     */
    function initialize(
        Avatar _avatar,
        IntVoteInterface _votingMachine,
        uint[11] calldata _votingParamsRegister,
        address _voteOnBehalfRegister,
        bytes32 _voteRegisterParamsHash,
        uint[11] calldata _votingParamsRemove,
        address _voteOnBehalfRemove,
        bytes32 _voteRemoveParamsHash
    )
    external
    initializer
    {
        require(_avatar != Avatar(0), "avatar cannot be zero");
        avatar = _avatar;
        votingMachine = _votingMachine;
        if (_voteRegisterParamsHash == bytes32(0)) {
            //genesisProtocol
            GenesisProtocol genesisProtocol = GenesisProtocol(address(_votingMachine));
            voteRegisterParamsHash = genesisProtocol.getParametersHash(_votingParamsRegister, _voteOnBehalfRegister);
            (uint256 queuedVoteRequiredPercentage, , , , , , , , , , , ,) =
            genesisProtocol.parameters(voteRegisterParamsHash);
            if (queuedVoteRequiredPercentage == 0) {
               //params not set already
                genesisProtocol.setParameters(_votingParamsRegister, _voteOnBehalfRegister);
            }
        } else {
            //for other voting machines
            voteRegisterParamsHash = _voteRegisterParamsHash;
        }

        if (_voteRemoveParamsHash == bytes32(0)) {
            //genesisProtocol
            GenesisProtocol genesisProtocol = GenesisProtocol(address(_votingMachine));
            voteRemoveParamsHash = genesisProtocol.getParametersHash(_votingParamsRemove, _voteOnBehalfRemove);
            (uint256 queuedVoteRequiredPercentage, , , , , , , , , , , ,) =
            genesisProtocol.parameters(voteRemoveParamsHash);
            if (queuedVoteRequiredPercentage == 0) {
               //params not set already
                genesisProtocol.setParameters(_votingParamsRemove, _voteOnBehalfRemove);
            }
        } else {
            //for other voting machines
            voteRemoveParamsHash = _voteRemoveParamsHash;
        }
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
        proposalsInfo[address(votingMachine)][proposalId] = ProposalInfo({
            blockNumber:block.number,
            avatar:avatar
        });
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
        proposalsInfo[address(votingMachine)][proposalId] = ProposalInfo({
            blockNumber:block.number,
            avatar:avatar
        });
        return proposalId;
    }
}
