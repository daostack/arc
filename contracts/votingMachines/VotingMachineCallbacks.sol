pragma solidity 0.5.15;

import "@daostack/infra-experimental/contracts/votingMachines/GenesisProtocol.sol";
import "@daostack/infra-experimental/contracts/Reputation.sol";
import "../libs/DAOCallerHelper.sol";


contract VotingMachineCallbacks is VotingMachineCallbacksInterface {
    using DAOCallerHelper for DAO;

    struct ProposalInfo {
        uint256 blockNumber; // the proposal's block number
        DAO dao; // the proposal's dao
    }

    modifier onlyVotingMachine(bytes32 _proposalId) {
        require(proposalsInfo[msg.sender][_proposalId].dao != DAO(address(0)), "only VotingMachine");
        _;
    }

    // VotingMaching  ->  proposalId  ->  ProposalInfo
    mapping(address => mapping(bytes32 => ProposalInfo)) public proposalsInfo;

    function mintReputation(uint256 _amount, address _beneficiary, bytes32 _proposalId)
    external
    onlyVotingMachine(_proposalId)
    returns(bool)
    {
        DAO dao = proposalsInfo[msg.sender][_proposalId].dao;
        if (dao == DAO(0)) {
            return false;
        }
        return dao.reputationMint(_beneficiary, _amount);
    }

    function burnReputation(uint256 _amount, address _beneficiary, bytes32 _proposalId)
    external
    onlyVotingMachine(_proposalId)
    returns(bool)
    {
        DAO dao = proposalsInfo[msg.sender][_proposalId].dao;
        if (dao == DAO(0)) {
            return false;
        }
        return dao.reputationBurn(_beneficiary, _amount);
    }

    function stakingTokenTransfer(
        IERC20 _stakingToken,
        address _beneficiary,
        uint256 _amount,
        bytes32 _proposalId)
    external
    onlyVotingMachine(_proposalId)
    returns(bool)
    {
        DAO dao = proposalsInfo[msg.sender][_proposalId].dao;
        if (dao == DAO(0)) {
            return false;
        }
        return dao.externalTokenTransfer(_stakingToken, _beneficiary, _amount);
    }

    function balanceOfStakingToken(IERC20 _stakingToken, bytes32 _proposalId) external view returns(uint256) {
        DAO dao = proposalsInfo[msg.sender][_proposalId].dao;
        if (proposalsInfo[msg.sender][_proposalId].dao == DAO(0)) {
            return 0;
        }
        return _stakingToken.balanceOf(address(dao));
    }

    function getTotalReputationSupply(bytes32 _proposalId) external view returns(uint256) {
        ProposalInfo memory proposal = proposalsInfo[msg.sender][_proposalId];
        if (proposal.dao == DAO(0)) {
            return 0;
        }
        return Reputation(proposal.dao.nativeReputation()).totalSupplyAt(proposal.blockNumber);
    }

    function reputationOf(address _owner, bytes32 _proposalId) external view returns(uint256) {
        ProposalInfo memory proposal = proposalsInfo[msg.sender][_proposalId];
        if (proposal.dao == DAO(0)) {
            return 0;
        }
        return Reputation(proposal.dao.nativeReputation()).balanceOfAt(_owner, proposal.blockNumber);
    }
}
