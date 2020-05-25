pragma solidity ^0.5.17;

import "@daostack/infra-experimental/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra-experimental/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "../votingMachines/VotingMachineCallbacks.sol";


/**
 * @title A scheme to manage global constraint for organizations
 * @dev The scheme is used to register or remove new global constraints
 */
contract GlobalConstraintRegistrar is VotingMachineCallbacks, ProposalExecuteInterface {

    event NewGlobalConstraintsProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        address _gc,
        string _descriptionHash
    );

    event RemoveGlobalConstraintsProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _intVoteInterface,
        address _gc,
        string _descriptionHash
    );

    event ProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId, int256 _param);
    event ProposalDeleted(address indexed _avatar, bytes32 indexed _proposalId);

    // The struct that holds the information of a global constraint proposed to be added or removed.
    struct GCProposal {
        address gc; // The address of the global constraint contract.
        bool addGC; // true: add a GC, false: remove a GC.
        IntVoteInterface votingMachineToRemove; // voting machine to remove the GC.
    }

    // GCProposal by avatar and proposalId
    mapping(bytes32=>GCProposal) public organizationProposals;

    // votingMachineToRemove  by avatar and proposal.gc
    mapping(address=>IntVoteInterface) public votingMachineToRemove;

    uint64[3] public packageVersion;
    string public votingMachineName;

    /**
     * @dev initialize
     * @param _avatar the avatar this scheme referring to.
     * @param _votingParams genesisProtocol parameters
     * @param _voteOnBehalf  parameter
     * @param _daoFactory  DAOFactory instance to instance a votingMachine.
     * @param _stakingToken (for GenesisProtocol)
     * @param _packageVersion packageVersion to instance the votingMachine from.
     * @param _votingMachineName the votingMachine contract name.
     */
    function initialize(
        Avatar _avatar,
        uint256[11] calldata _votingParams,
        address _voteOnBehalf,
        DAOFactory _daoFactory,
        address _stakingToken,
        uint64[3] calldata _packageVersion,
        string calldata _votingMachineName
    )
    external
    {
        super._initializeGovernance(
            _avatar,
            _votingParams,
            _voteOnBehalf,
            _daoFactory,
            _stakingToken,
            address(this),
            address(this),
            address(this),
            _packageVersion,
            _votingMachineName);
        packageVersion = _packageVersion;
        votingMachineName = _votingMachineName;
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _decision the voting result, 1 yes and 2 is no.
    * @return bool which represents a successful of the function.
    */
    function executeProposal(bytes32 _proposalId, int256 _decision)
    external
    onlyVotingMachine(_proposalId)
    returns(bool) {
        bool retVal = true;

        // Check if vote was successful:
        GCProposal memory proposal = organizationProposals[_proposalId];

        require(proposal.gc != address(0));
        delete organizationProposals[_proposalId];
        emit ProposalDeleted(address(avatar), _proposalId);

        if (_decision == 1) {

        // Define controller and get the params:
            Controller controller = Controller(avatar.owner());

        // Adding a GC
            if (proposal.addGC) {
                retVal = controller.addGlobalConstraint(proposal.gc);
                votingMachineToRemove[proposal.gc] = proposal.votingMachineToRemove;
            }
        // Removing a GC
            if (!proposal.addGC) {
                retVal = controller.removeGlobalConstraint(proposal.gc);
            }
        }
        emit ProposalExecuted(address(avatar), _proposalId, _decision);
        return retVal;
    }

    /**
    * @dev propose to add a new global constraint:
    * @param _gc the address of the global constraint that is being proposed
    * @param _descriptionHash proposal's description hash
    * @param _votingParams genesisProtocol parameters -
    *        the conditions (on the voting machine) for removing this global constraint
    * @param _addresses array of addresses - the conditions (on the voting machine) for removing this global constraint
    *       addresses[0] - _daoFactory DAOFactory instance to instance a votingMachine.
    *       addresses[1] - _voteOnBehalf  parameter
    *       addresses[2] - _organization organization
    *       addresses[3] - _callbacks should fulfill voting callbacks interface
    *       addresses[4] - _authorizedToPropose only this address allow to propose (unless it is zero)
    *       addresses[5] - _stakingToken (for GenesisProtocol)
    * @return bytes32 -the proposal id
    */
    function proposeGlobalConstraint(
    address _gc,
    string calldata _descriptionHash,
    uint256[11] calldata _votingParams,
    address[6] calldata _addresses)
    external
    returns(bytes32)
    {
        bytes32 proposalId = votingMachine.propose(2, msg.sender);
        //instance voting machine to remove this GC.
        require(_addresses[0] != address(0), "daoFactory cannot be zero");
        bytes memory initData;
        if (votingMachineName.hashCompareWithLengthCheck("GenesisProtocol")) {
            initData = abi.encodeWithSignature(
                GENESIS_PROTOCOL_INIT_FUNC_SIGNATURE,
                _addresses[5],
                _votingParams,
                _addresses[1],
                _addresses[2],
                _addresses[3],
                _addresses[4]);
        } else {
            initData = abi.encodeWithSignature(
                    ABSOLUTE_VOTE_INIT_FUNC_SIGNATURE,
                    _votingParams[0],
                    _addresses[1],
                    _addresses[2],
                    _addresses[3],
                    _addresses[4]);
        }
        votingMachineToRemove[_gc] = IntVoteInterface(address(DAOFactory(_addresses[0]).createInstance(
                            packageVersion,
                            votingMachineName,
                            address(avatar),
                            initData)));

        GCProposal memory proposal = GCProposal({
            gc: _gc,
            addGC: true,
            votingMachineToRemove: votingMachineToRemove[_gc]
        });

        organizationProposals[proposalId] = proposal;
        emit NewGlobalConstraintsProposal(
            address(avatar),
            proposalId,
            address(votingMachine),
            _gc,
            _descriptionHash
        );
        proposalsBlockNumber[proposalId] = block.number;
        return proposalId;
    }

    /**
    * @dev propose to remove a global constraint:
    * @param _gc the address of the global constraint that is being proposed
    * @param _descriptionHash proposal's description hash
    * @return bytes32 -the proposal id
    */
    function proposeToRemoveGC(address _gc, string memory _descriptionHash) public returns(bytes32) {
        Controller controller = Controller(avatar.owner());
        require(controller.isGlobalConstraintRegistered(_gc), "proposed gc is not register");
        bytes32 proposalId = votingMachineToRemove[_gc].propose(2, msg.sender);

        GCProposal memory proposal = GCProposal({
            gc: _gc,
            addGC: false,
            votingMachineToRemove:IntVoteInterface(0)
        });

        organizationProposals[proposalId] = proposal;
        emit RemoveGlobalConstraintsProposal(
        address(avatar),
        proposalId,
        address(votingMachineToRemove[_gc]),
        _gc,
        _descriptionHash);

        proposalsBlockNumber[proposalId] = block.number;
        return proposalId;
    }
}
