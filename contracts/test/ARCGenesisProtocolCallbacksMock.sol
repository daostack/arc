pragma solidity ^0.5.17;

import "../votingMachines/VotingMachineCallbacks.sol";


contract ARCVotingMachineCallbacksMock is VotingMachineCallbacks {
    function initialize(Avatar _avatar)
    external {
        super._initialize(_avatar);
    }

    function propose(bytes32 _proposalId, address _votingMachine) public {
        proposalsBlockNumber[_votingMachine][_proposalId] = block.number;
    }
}
