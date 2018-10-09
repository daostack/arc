pragma solidity ^0.4.25;

import "@daostack/infra/contracts/VotingMachines/GenesisProtocol.sol";
import "@daostack/infra/contracts/VotingMachines/AbsoluteVote.sol";
import "@daostack/infra/contracts/VotingMachines/QuorumVote.sol";
import "@daostack/infra/contracts/test/AbsoluteVoteExecuteMock.sol";
import "@daostack/infra/contracts/test/GenesisProtocolCallbacksMock.sol";

/*
    A contract you can inherit from that has some useful Events to print statements.
*/


contract ARCDebug {
    event LogAddress(address _msg);
    event LogInt(int _msg);
    event LogString(string _msg);
    event LogUint(uint _msg);
    event LogBytes(bytes _msg);
    event LogBytes32(bytes32 _msg);
    event LogBool(bool _msg);
}
