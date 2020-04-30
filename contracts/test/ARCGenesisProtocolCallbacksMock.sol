pragma solidity ^0.5.17;

import "../votingMachines/VotingMachineCallbacks.sol";


contract ARCVotingMachineCallbacksMock is VotingMachineCallbacks {
    function initialize(Avatar _avatar, address votingMachine)
    external {
        super._initialize(_avatar, IntVoteInterface(votingMachine), 0);
    }

    function propose(bytes32 _proposalId) public {
        proposalsBlockNumber[_proposalId] = block.number;
    }
}
