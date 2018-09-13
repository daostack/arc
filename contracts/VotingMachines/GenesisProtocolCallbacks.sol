pragma solidity ^0.4.24;

import "../universalSchemes/UniversalScheme.sol";
import "@daostack/infra/contracts/VotingMachines/GenesisProtocol.sol";


contract GenesisProtocolCallbacks is GenesisProtocolCallbacksInterface {

    struct ProposalInfo {
        uint blockNumber; // the proposal's block number
        Avatar avatar; // the proposal's avatar
        address votingMachine;
    }

    modifier onlyVotingMachine(bytes32 _proposalId) {
        require(msg.sender == proposalsInfo[_proposalId].votingMachine,"only VotingMachine");
        _;
    }
            //proposalId ->     ProposalInfo
    mapping(bytes32      =>     ProposalInfo    ) proposalsInfo;

    function getTotalReputationSupply(bytes32 _proposalId) external view returns(uint256) {
        ProposalInfo memory proposal = proposalsInfo[_proposalId];
        if (proposal.avatar == Avatar(0)) {
            return 0;
        }
        return proposal.avatar.nativeReputation().totalSupplyAt(proposal.blockNumber);
    }

    function mintReputation(uint _amount,address _beneficiary,bytes32 _proposalId) external onlyVotingMachine(_proposalId) returns(bool) {
        Avatar avatar = proposalsInfo[_proposalId].avatar;
        if (avatar == Avatar(0)) {
            return false;
        }
        return ControllerInterface(avatar.owner()).mintReputation(_amount,_beneficiary,address(avatar));
    }

    function burnReputation(uint _amount,address _beneficiary,bytes32 _proposalId) external onlyVotingMachine(_proposalId) returns(bool) {
        Avatar avatar = proposalsInfo[_proposalId].avatar;
        if (avatar == Avatar(0)) {
            return false;
        }
        return ControllerInterface(avatar.owner()).burnReputation(_amount,_beneficiary,address(avatar));
    }

    function reputationOf(address _owner,bytes32 _proposalId) external view returns(uint) {
        ProposalInfo memory proposal = proposalsInfo[_proposalId];
        if (proposal.avatar == Avatar(0)) {
            return 0;
        }
        return proposal.avatar.nativeReputation().balanceOfAt(_owner,proposal.blockNumber);
    }

    function stakingTokenTransfer(
        StandardToken _stakingToken,
        address _beneficiary,
        uint _amount,
        bytes32 _proposalId)
    external
    onlyVotingMachine(_proposalId)
    returns(bool)
    {
        Avatar avatar = proposalsInfo[_proposalId].avatar;
        if (avatar == Avatar(0)) {
            return false;
        }
        return ControllerInterface(avatar.owner()).externalTokenTransfer(_stakingToken,_beneficiary,_amount,address(avatar));
    }

}
