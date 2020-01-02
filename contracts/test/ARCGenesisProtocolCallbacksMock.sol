pragma solidity 0.5.15;

import "../votingMachines/VotingMachineCallbacks.sol";


contract ARCVotingMachineCallbacksMock is VotingMachineCallbacks {

    function propose(bytes32 _proposalId, DAO _dao, address _votingMachine) public {
        proposalsInfo[_votingMachine][_proposalId] = ProposalInfo({
            blockNumber:block.number,
            dao:_dao
        });
    }
}
