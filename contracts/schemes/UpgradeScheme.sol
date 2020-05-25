pragma solidity ^0.5.17;

import "@daostack/infra-experimental/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra-experimental/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "../votingMachines/VotingMachineCallbacks.sol";
import "../libs/Bytes32ToStr.sol";
import "../registry/Package.sol";
import "../registry/ImplementationProvider.sol";


/**
 * @title UpgradeScheme.
 * @dev  A scheme for proposing updates
 */
contract UpgradeScheme is VotingMachineCallbacks, ProposalExecuteInterface {
    using Bytes32ToStr for bytes32;

    event NewUpgradeProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        uint64[3] _packageVersion,
        bytes32[] _contractsNames,
        address[] _contractsToUpgrade,
        string  _descriptionHash
    );

    event ProposalExecuted(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        bool _decision
    );

    event ProposalDeleted(address indexed _avatar, bytes32 indexed _proposalId);

    // Details of a voting proposal:
    struct Proposal {
        uint64[3] packageVersion;
        bytes32[] contractsNames;
        address[] contractsToUpgrade;
        bool exist;
    }

    mapping(bytes32=>Proposal) public organizationProposals;

    Package public arcPackage;

    /**
     * @dev initialize
     * @param _avatar the avatar this scheme referring to.
     * @param _votingParams genesisProtocol parameters
     * @param _voteOnBehalf  parameter
     * @param _daoFactory  DAOFactory instance to instance a votingMachine.
     * @param _stakingToken (for GenesisProtocol)
     * @param _packageVersion packageVersion to instance the votingMachine from.
     * @param _votingMachineName the votingMachine contract name.
     * @param _arcPackage the arc package to upgrade from
     */
    function initialize(
        Avatar _avatar,
        uint256[11] calldata _votingParams,
        address _voteOnBehalf,
        DAOFactory _daoFactory,
        address _stakingToken,
        uint64[3] calldata _packageVersion,
        string calldata _votingMachineName,
        Package _arcPackage
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
        arcPackage = _arcPackage;
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _decision a parameter of the voting result, 1 yes and 2 is no.
    * @return bool success
    */
    function executeProposal(bytes32 _proposalId, int256 _decision)
    external
    onlyVotingMachine(_proposalId)
    returns(bool) {
        Proposal storage proposal = organizationProposals[_proposalId];
        require(proposal.exist, "must be a live proposal");

        if (_decision == 1) {
            proposal.exist = false;
            address[] memory contractsToUpgrade = proposal.contractsToUpgrade;
            for (uint256 i = 0; i < contractsToUpgrade.length; i++) {
                bytes32 contractNameBytes = proposal.contractsNames[i];
                string memory contractName = contractNameBytes.toStr();
                address updatedImp = ImplementationProvider(
                    arcPackage.getContract(proposal.packageVersion)
                ).getImplementation(contractName);

                Controller controller = Controller(avatar.owner());
                controller.genericCall(
                    contractsToUpgrade[i],
                    abi.encodeWithSignature("upgradeTo(address)", updatedImp),
                    0
                );
            }
        }

        delete organizationProposals[_proposalId];
        emit ProposalDeleted(address(avatar), _proposalId);
        emit ProposalExecuted(address(avatar), _proposalId, _decision == 1);
        return true;
    }

    /**
    * @dev propose upgrade contracts Arc version
    *      The function trigger NewUpgradeProposal event
    * @param _packageVersion - the new Arc version to use for the contracts
    * @param _contractsNames - names of contracts which needs to be upgraded
    * @param _contractsToUpgrade - addresses of contracts which needs to be upgraded
    * @param _descriptionHash - proposal description hash
    * @return an id which represents the proposal
    */
    function proposeUpgrade(
        uint64[3] memory _packageVersion,
        bytes32[] memory _contractsNames,
        address[] memory _contractsToUpgrade,
        string memory _descriptionHash)
    public
    returns(bytes32 proposalId)
    {
        require(_contractsNames.length <= 60, "can upgrade up to 60 contracts at a time");
        require(
            _contractsNames.length == _contractsToUpgrade.length,
            "upgrade name and address arrays must have equal lengths"
        );
        require(arcPackage.hasVersion(_packageVersion), "Specified version doesn't exist in the Package");
        for (uint256 i = 0; i < _contractsToUpgrade.length; i++) {
            require(
                ImplementationProvider(
                    arcPackage.getContract(_packageVersion)
                ).getImplementation(_contractsNames[i].toStr()) != address(0),
                "Contract name does not exist in ArcHive package"
            );
        }

        proposalId = votingMachine.propose(2, msg.sender);

        organizationProposals[proposalId] = Proposal({
            packageVersion: _packageVersion,
            contractsNames: _contractsNames,
            contractsToUpgrade: _contractsToUpgrade,
            exist: true
        });
        proposalsBlockNumber[proposalId] = block.number;
        emit NewUpgradeProposal(
            address(avatar),
            proposalId,
            _packageVersion,
            _contractsNames,
            _contractsToUpgrade,
            _descriptionHash
        );
    }
}
