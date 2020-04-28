pragma solidity ^0.5.17;

import "@daostack/infra-experimental/contracts/votingMachines/GenesisProtocol.sol";
import "../controller/Avatar.sol";
import "../controller/Controller.sol";
import "../schemes/ArcScheme.sol";


contract VotingMachineCallbacks is VotingMachineCallbacksInterface, ArcScheme {

    modifier onlyVotingMachine(bytes32 _proposalId) {
        require(proposalsBlockNumber[msg.sender][_proposalId] != 0, "only VotingMachine");
        _;
    }

    // VotingMaching  ->  proposalId  ->  blockNumber
    mapping(address => mapping(bytes32 => uint256)) public proposalsBlockNumber;

    function mintReputation(uint256 _amount, address _beneficiary, bytes32 _proposalId)
    external
    onlyVotingMachine(_proposalId)
    returns(bool)
    {
        return Controller(avatar.owner()).mintReputation(_amount, _beneficiary);
    }

    function burnReputation(uint256 _amount, address _beneficiary, bytes32 _proposalId)
    external
    onlyVotingMachine(_proposalId)
    returns(bool)
    {
        return Controller(avatar.owner()).burnReputation(_amount, _beneficiary);
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
        return Controller(avatar.owner()).externalTokenTransfer(_stakingToken, _beneficiary, _amount);
    }

    function balanceOfStakingToken(IERC20 _stakingToken, bytes32 _proposalId)
    external view onlyVotingMachine(_proposalId) returns(uint256)
    {
        return _stakingToken.balanceOf(address(avatar));
    }

    function getTotalReputationSupply(bytes32 _proposalId)
    external view onlyVotingMachine(_proposalId) returns(uint256)
    {
        return avatar.nativeReputation().totalSupplyAt(proposalsBlockNumber[msg.sender][_proposalId]);
    }

    function reputationOf(address _owner, bytes32 _proposalId)
    external view onlyVotingMachine(_proposalId) returns(uint256)
    {
        return avatar.nativeReputation().balanceOfAt(_owner, proposalsBlockNumber[msg.sender][_proposalId]);
    }
}
