const helpers = require('./helpers');
const constants = require('./constants');
const AbsoluteVote = artifacts.require('AbsoluteVote');
const QuorumVote = artifacts.require('QuorumVote');
const StandardToken = artifacts.require('StandardToken');
const Reputation = artifacts.require('Reputation');
const ExecutableTest = artifacts.require('ExecutableTest');
const Avatar = artifacts.require('Avatar');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const ControllerCreator = artifacts.require("./ControllerCreator.sol");


const setupGenesisProtocol = async function (accounts) {
   var testSetup = new helpers.TestSetup();
   testSetup.votingMachine = await helpers.setupGenesisProtocol(accounts,0);
   var controllerCreator = await ControllerCreator.new({gas: constants.ARC_GAS_LIMIT});
   testSetup.daoCreator = await DaoCreator.new(controllerCreator.address,{gas:constants.ARC_GAS_LIMIT});
   testSetup.org = await helpers.setupOrganization(testSetup.daoCreator,accounts[0],1000,1000);
   var permissions = "0x00000000";
   testSetup.executable = await ExecutableTest.new();
   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,[testSetup.votingMachine.genesisProtocol.address],[testSetup.votingMachine.params],[permissions]);

   return testSetup;
};

contract('VotingMachine', (accounts)=>{
  it('proposalId should be globally unique', async () =>{
    const token = await StandardToken.new();
    const rep = await Reputation.new();
    const absolute = await AbsoluteVote.new();
    const quorum = await QuorumVote.new(token.address);
    const avatar = await Avatar.new('name', helpers.NULL_ADDRESS, rep.address);
    const executable = await ExecutableTest.new();

    const absoluteParams = await absolute.setParameters.call(rep.address,50,true);
    await absolute.setParameters(rep.address,50,true);

    var genesisProtocol = await setupGenesisProtocol(accounts);

    const quoromParams = await quorum.setParameters.call(rep.address,50,true);
    await quorum.setParameters(rep.address,50,true);

    const absoluteProposalId = await absolute.propose(5, absoluteParams, avatar.address, executable.address,accounts[0]);
    const genesisProposalId = await genesisProtocol.votingMachine.genesisProtocol.propose(2, 0, genesisProtocol.org.avatar.address, executable.address,accounts[0]);
    const quorumProposalId = await quorum.propose(5, quoromParams, avatar.address, executable.address,accounts[0]);

    assert(absoluteProposalId !== genesisProposalId, 'AbsoluteVote gives the same proposalId as GenesisProtocol');
    assert(genesisProposalId !== quorumProposalId, 'GenesisProtocol gives the same proposalId as QuorumVote');
    assert(quorumProposalId !== absoluteProposalId, 'QuorumVote gives the same proposalId as AbsoluteVote');
  });
});
