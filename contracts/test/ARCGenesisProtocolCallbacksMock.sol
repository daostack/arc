pragma solidity ^0.4.24;

import "../VotingMachines/VotingMachineCallbacks.sol";


contract ARCVotingMachineCallbacksMock is VotingMachineCallbacks {

    function propose(bytes32 _proposalId,Avatar _avatar,address _votingMachine) public {
        proposalsInfo[_proposalId] = ProposalInfo(
            {blockNumber:block.number,
            avatar:_avatar,
            votingMachine:_votingMachine});
    }
}
