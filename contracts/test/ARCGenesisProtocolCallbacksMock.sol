pragma solidity 0.5.13;

import "../votingMachines/VotingMachineCallbacks.sol";


contract ARCVotingMachineCallbacksMock is VotingMachineCallbacks {

    function propose(bytes32 _proposalId, Avatar _avatar, address _votingMachine) public {
        proposalsInfo[_votingMachine][_proposalId] = ProposalInfo({
            blockNumber:block.number,
            avatar:_avatar
        });
    }
}
