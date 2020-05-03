pragma solidity ^0.5.17;

import "../votingMachines/VotingMachineCallbacks.sol";


contract ARCVotingMachineCallbacksMock is VotingMachineCallbacks {
    function initialize(Avatar _avatar, address _votingMachine)
    external {
        super._initialize(
            _avatar,
            IntVoteInterface(0),
            0,
            [uint256(0), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            address(0)
        );
        votingMachine = IntVoteInterface(_votingMachine);
    }

    function propose(bytes32 _proposalId) public {
        proposalsBlockNumber[_proposalId] = block.number;
    }
}
