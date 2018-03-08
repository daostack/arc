const helpers = require('./helpers');
const AbsoluteVote = artifacts.require('AbsoluteVote');
const GenesisProtocol = artifacts.require('GenesisProtocol');
const QuorumVote = artifacts.require('QuorumVote');
const StandardToken = artifacts.require('StandardToken');
const Reputation = artifacts.require('Reputation');
const ExecutableTest = artifacts.require('ExecutableTest');
const Avatar = artifacts.require('Avatar');

contract('VotingMachine', (accounts)=>{
  it('proposalId should be globally unique', async () =>{
    const token = await StandardToken.new();
    const rep = await Reputation.new();
    const absolute = await AbsoluteVote.new();
    const genesis = await GenesisProtocol.new(token.address);
    const quorum = await QuorumVote.new(token.address);
    const avatar = await Avatar.new('name', helpers.NULL_ADDRESS, rep.address);
    const executable = await ExecutableTest.new();

    const absoluteParams = await absolute.setParameters.call(rep.address,50,true);
    await absolute.setParameters(rep.address,50,true);
    const genesisParams = await genesis.setParameters.call([50,60,60,1,1,0,0,60,1,1,10,80],0);
    await genesis.setParameters([50,60,60,1,1,0,0,60,1,1,10,80],0);
    const quoromParams = await quorum.setParameters.call(rep.address,50,true);
    await quorum.setParameters(rep.address,50,true);

    const absoluteProposalId = await absolute.propose(5, absoluteParams, avatar.address, executable.address,accounts[0]);
    const genesisProposalId = await genesis.propose(2, genesisParams, avatar.address, executable.address,accounts[0]);
    const quorumProposalId = await quorum.propose(5, quoromParams, avatar.address, executable.address,accounts[0]);

    assert(absoluteProposalId !== genesisProposalId, 'AbsoluteVote gives the same proposalId as GenesisProtocol');
    assert(genesisProposalId !== quorumProposalId, 'GenesisProtocol gives the same proposalId as QuorumVote');
    assert(quorumProposalId !== absoluteProposalId, 'QuorumVote gives the same proposalId as AbsoluteVote');
  });
});
