pragma solidity ^0.6.12;
// SPDX-License-Identifier: GPL-3.0

import "../votingMachines/VotingMachineCallbacks.sol";


contract ARCVotingMachineCallbacksMock is VotingMachineCallbacks {
    function initialize(Avatar _avatar, address _votingMachine)
    external {
        super._initialize(_avatar);
        votingMachine = IntVoteInterface(_votingMachine);
    }

    function propose(bytes32 _proposalId) public {
        proposalsBlockNumber[_proposalId] = block.number;
    }
}
