pragma solidity ^0.5.2;

import "@daostack/infra/contracts/votingMachines/GenesisProtocol.sol";
import "@daostack/infra/contracts/votingMachines/AbsoluteVote.sol";
import "@daostack/infra/contracts/votingMachines/QuorumVote.sol";
import "@daostack/infra/contracts/test/AbsoluteVoteExecuteMock.sol";
import "@daostack/infra/contracts/test/GenesisProtocolCallbacksMock.sol";

/*
    A contract you can inherit from that has some useful Events to print statements.
*/


contract ARCDebug {
    event LogAddress(address _msg);
    event LogInt(int256 _msg);
    event LogString(string _msg);
    event LogUint(uint256 _msg);
    event LogBytes(bytes _msg);
    event LogBytes32(bytes32 _msg);
    event LogBool(bool _msg);
}
