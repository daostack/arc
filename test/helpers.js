/**
    helpers for tests
*/

const Avatar = artifacts.require("./Avatar.sol");
const DAOToken = artifacts.require("./DAOToken.sol");
const Reputation = artifacts.require("./Reputation.sol");
const AbsoluteVote = artifacts.require("./AbsoluteVote.sol");
const constants = require('./constants');
const GenesisProtocol = artifacts.require("./GenesisProtocol.sol");
const DAOFactory = artifacts.require("./DAOFactory.sol");
const SchemeMock = artifacts.require('./test/SchemeMock.sol');
const Wallet = artifacts.require('./test/Wallet.sol');
const App = artifacts.require("./App.sol");
const Package = artifacts.require("./Package.sol");
var ImplementationDirectory = artifacts.require("./ImplementationDirectory.sol");
var Controller = artifacts.require("./Controller.sol");
const ContributionReward = artifacts.require("./ContributionReward.sol");
const Competition = artifacts.require("./Competition.sol");
const ContributionRewardExt = artifacts.require("./ContributionRewardExt.sol");
const SchemeRegistrar = artifacts.require("./SchemeRegistrar.sol");
const GenericScheme = artifacts.require("./GenericScheme.sol");
const UpgradeScheme = artifacts.require("./UpgradeScheme.sol");
const Auction4Reputation = artifacts.require("./Auction4Reputation.sol");
const LockingEth4Reputation = artifacts.require("./LockingEth4Reputation.sol");
const LockingToken4Reputation = artifacts.require("./LockingToken4Reputation.sol");
const ContinuousLocking4Reputation = artifacts.require("./ContinuousLocking4Reputation.sol");
const ExternalLocking4Reputation = artifacts.require("./ExternalLocking4Reputation.sol");
const FixedReputationAllocation = artifacts.require("./FixedReputationAllocation.sol");
const GlobalConstraintRegistrar = artifacts.require("./GlobalConstraintRegistrar.sol");
const SignalScheme = artifacts.require("./SignalScheme.sol");


export const MAX_UINT_256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
export const NULL_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';
export const SOME_HASH = '0x1000000000000000000000000000000000000000000000000000000000000000';
export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
export const SOME_ADDRESS = '0x1000000000000000000000000000000000000000';

export class TestSetup {
  constructor() {
  }
}

export class VotingMachine {
  constructor() {
  }
}

export class Organization {
  constructor() {
  }
}

export class Registration {
  constructor() {
  }
}

export function getProposalAddress(tx) {
    // helper function that returns a proposal object from the ProposalCreated event
    // in the logs of tx
    assert.equal(tx.logs[0].event, 'ProposalCreated');
    const proposalAddress = tx.logs[0].args.proposaladdress;
    return proposalAddress;
}

export function getValueFromLogs(tx, arg, eventName, index=0) {
  /**
   *
   * tx.logs look like this:
   *
   * [ { logIndex: 13,
   *     transactionIndex: 0,
   *     transactionHash: '0x999e51b4124371412924d73b60a0ae1008462eb367db45f8452b134e5a8d56c8',
   *     blockHash: '0xe35f7c374475a6933a500f48d4dfe5dce5b3072ad316f64fbf830728c6fe6fc9',
   *     blockNumber: 294,
   *     address: '0xd6a2a42b97ba20ee8655a80a842c2a723d7d488d',
   *     type: 'mined',
   *     event: 'NewOrg',
   *     args: { _avatar: '0xcc05f0cde8c3e4b6c41c9b963031829496107bbb' } } ]
   */
  if (!tx.logs || !tx.logs.length) {
    throw new Error('getValueFromLogs: Transaction has no logs');
  }

  if (eventName !== undefined) {
    for (let i=0; i < tx.logs.length; i++) {
      if (tx.logs[i].event  === eventName) {
        index = i;
        break;
      }
    }
    if (index === undefined) {
      let msg = `getValueFromLogs: There is no event logged with eventName ${eventName}`;
      throw new Error(msg);
    }
  } else {
    if (index === undefined) {
      index = tx.logs.length - 1;
    }
  }
  let result = tx.logs[index].args[arg];
  if (!result) {
    let msg = `getValueFromLogs: This log does not seem to have a field "${arg}": ${tx.logs[index].args}`;
    throw new Error(msg);
  }
  return result;
}

export async function getProposal(tx) {
    return await Proposal.at(getProposalAddress(tx));
}

export async function etherForEveryone(accounts) {
    // give all web3.eth.accounts some ether
    for (let i=0; i < 10; i++) {
        await web3.eth.sendTransaction({to: accounts[i], from: accounts[0], value: web3.utils.toWei("0.1", "ether")});
    }
}

export const outOfGasMessage = 'VM Exception while processing transaction: out of gas';

export function assertJumpOrOutOfGas(error) {
    let condition = (
        error.message === outOfGasMessage ||
        error.message.search('invalid JUMP') > -1
    );
    assert.isTrue(condition, 'Expected an out-of-gas error or an invalid JUMP error, got this instead: ' + error.message);
}

export function assertVMException(error) {
    let condition = (
        error.message.search('VM Exception') > -1
    );
    assert.isTrue(condition, 'Expected a VM Exception, got this instead:' + error.message);
}

export function assertInternalFunctionException(error) {
    let condition = (
        error.message.search('is not a function') > -1
    );
    assert.isTrue(condition, 'Expected a function not found Exception, got this instead:' + error.message);
}

export function assertJump(error) {
  assert.isAbove(error.message.search('invalid JUMP'), -1, 'Invalid JUMP error must be returned' + error.message);
}
export const registrationAddVersionToPackege = async function (registration,version = [0,1,0]) {
  var packageName = "DAOstack";

  var implementationDirectory = await ImplementationDirectory.new();
  await registration.packageInstance.addVersion(version,implementationDirectory.address,NULL_HASH);
  await registration.app.setPackage(packageName,registration.packageInstance.address,version);
  registration.daoToken = await DAOToken.new();
  registration.reputation = await Reputation.new();
  registration.avatar = await Avatar.new();
  registration.controller = await Controller.new();
  registration.schemeMock = await SchemeMock.new();
  registration.wallet = await Wallet.new();
  registration.contributionReward = await ContributionReward.new();
  registration.competition = await Competition.new();
  registration.contributionRewardExt = await ContributionRewardExt.new();
  registration.schemeRegistrar = await SchemeRegistrar.new();
  registration.genericScheme = await GenericScheme.new();
  registration.upgradeScheme = await UpgradeScheme.new();
  registration.auction4Reputation = await Auction4Reputation.new();
  registration.lockingEth4Reputation = await LockingEth4Reputation.new();
  registration.lockingToken4Reputation = await LockingToken4Reputation.new();
  registration.continuousLocking4Reputation = await ContinuousLocking4Reputation.new();
  registration.externalLocking4Reputation = await ExternalLocking4Reputation.new();
  registration.fixedReputationAllocation = await FixedReputationAllocation.new();
  registration.globalConstraintRegistrar = await GlobalConstraintRegistrar.new();
  registration.signalScheme = await SignalScheme.new();


  await implementationDirectory.setImplementation("DAOToken",registration.daoToken.address);
  await implementationDirectory.setImplementation("Reputation",registration.reputation.address);
  await implementationDirectory.setImplementation("Avatar",registration.avatar.address);
  await implementationDirectory.setImplementation("Controller",registration.controller.address);
  await implementationDirectory.setImplementation("SchemeMock",registration.schemeMock.address);
  await implementationDirectory.setImplementation("Wallet",registration.wallet.address);
  await implementationDirectory.setImplementation("ContributionReward",registration.contributionReward.address);
  await implementationDirectory.setImplementation("Competition",registration.competition.address);
  await implementationDirectory.setImplementation("ContributionRewardExt",registration.contributionRewardExt.address);
  await implementationDirectory.setImplementation("SchemeRegistrar",registration.schemeRegistrar.address);
  await implementationDirectory.setImplementation("GenericScheme",registration.genericScheme.address);
  await implementationDirectory.setImplementation("UpgradeScheme",registration.upgradeScheme.address);
  await implementationDirectory.setImplementation("Auction4Reputation",registration.auction4Reputation.address);
  await implementationDirectory.setImplementation("LockingEth4Reputation",registration.lockingEth4Reputation.address);
  await implementationDirectory.setImplementation("LockingToken4Reputation",registration.lockingToken4Reputation.address);
  await implementationDirectory.setImplementation("ContinuousLocking4Reputation",registration.continuousLocking4Reputation.address);
  await implementationDirectory.setImplementation("ExternalLocking4Reputation",registration.externalLocking4Reputation.address);
  await implementationDirectory.setImplementation("FixedReputationAllocation",registration.fixedReputationAllocation.address);
  await implementationDirectory.setImplementation("GlobalConstraintRegistrar",registration.globalConstraintRegistrar.address);
  await implementationDirectory.setImplementation("SignalScheme",registration.signalScheme.address);


  return registration;
};

export const registerImplementation = async function (version = [0,1,0]) {
  var registration = new Registration();
  registration.packageInstance = await Package.new();
  registration.app = await App.new();
  registration = await registrationAddVersionToPackege(registration,version);
  registration.daoFactory = await DAOFactory.new({gas:constants.ARC_GAS_LIMIT});
  await registration.daoFactory.initialize(registration.app.address);
  return registration;
};

export const setupAbsoluteVote = async function (voteOnBehalf=NULL_ADDRESS, precReq=50 ) {
  var votingMachine = new VotingMachine();
  votingMachine.absoluteVote = await AbsoluteVote.new();
  // register some parameters
  await votingMachine.absoluteVote.setParameters( precReq, voteOnBehalf);
  votingMachine.params = await votingMachine.absoluteVote.getParametersHash( precReq, voteOnBehalf);
  return votingMachine;
};

export const setupGenesisProtocol = async function (
   accounts,
   token,
   voteOnBehalf = NULL_ADDRESS,
   _queuedVoteRequiredPercentage=50,
   _queuedVotePeriodLimit=60,
   _boostedVotePeriodLimit=60,
   _preBoostedVotePeriodLimit =0,
   _thresholdConst=2000,
   _quietEndingPeriod=0,
   _proposingRepReward=60,
   _votersReputationLossRatio=10,
   _minimumDaoBounty=15,
   _daoBountyConst=10,
   _activationTime=0
  ) {
  var votingMachine = new VotingMachine();

  votingMachine.genesisProtocol = await GenesisProtocol.new(token,{gas: constants.ARC_GAS_LIMIT});

  // set up a reputation system
  votingMachine.reputationArray = [20, 10 ,70];
  // register some parameters
  await votingMachine.genesisProtocol.setParameters([_queuedVoteRequiredPercentage,
                                                     _queuedVotePeriodLimit,
                                                     _boostedVotePeriodLimit,
                                                     _preBoostedVotePeriodLimit,
                                                     _thresholdConst,
                                                     _quietEndingPeriod,
                                                     _proposingRepReward,
                                                     _votersReputationLossRatio,
                                                     _minimumDaoBounty,
                                                     _daoBountyConst,
                                                     _activationTime],voteOnBehalf);
  votingMachine.params = await votingMachine.genesisProtocol.getParametersHash([_queuedVoteRequiredPercentage,
                                                     _queuedVotePeriodLimit,
                                                     _boostedVotePeriodLimit,
                                                     _preBoostedVotePeriodLimit,
                                                     _thresholdConst,
                                                     _quietEndingPeriod,
                                                     _proposingRepReward,
                                                     _votersReputationLossRatio,
                                                     _minimumDaoBounty,
                                                     _daoBountyConst,
                                                     _activationTime],voteOnBehalf);

  return votingMachine;
};

export const setupOrganizationWithArrays = async function (daoCreator,daoCreatorOwner,founderToken,founderReputation,cap=0) {
  var org = new Organization();
  var tx = await daoCreator.forgeOrg("testOrg","TEST","TST",daoCreatorOwner,founderToken,founderReputation,cap,{gas: constants.ARC_GAS_LIMIT});
  assert.equal(tx.logs.length, 1);
  assert.equal(tx.logs[0].event, "NewOrg");
  var avatarAddress = tx.logs[0].args._avatar;
  org.avatar = await Avatar.at(avatarAddress);
  var tokenAddress = await org.avatar.nativeToken();
  org.token = await DAOToken.at(tokenAddress);
  var reputationAddress = await org.avatar.nativeReputation();
  org.reputation = await Reputation.at(reputationAddress);
  return org;
};

export const setupOrganizationWithArraysDAOFactory = async function (proxyAdmin,
                                                                     accounts,
                                                                     registration,
                                                                     daoCreatorOwner,
                                                                     founderToken,
                                                                     founderReputation,
                                                                     cap=0) {
  var org = new Organization();
  var nativeTokenData = await new web3.eth.Contract(registration.daoToken.abi)
                        .methods
                        .initialize("TEST","TST",cap,registration.daoFactory.address)
                        .encodeABI();
  var tx = await registration.daoFactory.forgeOrg("testOrg",
                                                  nativeTokenData,
                                                  daoCreatorOwner,
                                                  founderToken,
                                                  founderReputation,
                                                  [0,0,0],
                                                  {from:proxyAdmin,gas:constants.ARC_GAS_LIMIT});
  assert.equal(tx.logs.length, 5);
  assert.equal(tx.logs[4].event, "NewOrg");
  var avatarAddress = tx.logs[4].args._avatar;
  org.avatar = await Avatar.at(avatarAddress);
  var tokenAddress = await org.avatar.nativeToken();
  org.token = await DAOToken.at(tokenAddress);
  var reputationAddress = await org.avatar.nativeReputation();
  org.reputation = await Reputation.at(reputationAddress);
  return org;
};

export const setupOrganization = async function (daoCreator,daoCreatorOwner,founderToken,founderReputation,cap=0) {
  var org = new Organization();
  var tx = await daoCreator.forgeOrg("testOrg","TEST","TST",[daoCreatorOwner],[founderToken],[founderReputation],cap,{gas: constants.ARC_GAS_LIMIT});
  assert.equal(tx.logs.length, 1);
  assert.equal(tx.logs[0].event, "NewOrg");
  var avatarAddress = tx.logs[0].args._avatar;
  org.avatar = await Avatar.at(avatarAddress);
  var tokenAddress = await org.avatar.nativeToken();
  org.token = await DAOToken.at(tokenAddress);
  var reputationAddress = await org.avatar.nativeReputation();
  org.reputation = await Reputation.at(reputationAddress);
  return org;
};


export const checkVoteInfo = async function(absoluteVote,proposalId, voterAddress, _voteInfo) {
  let voteInfo;
  voteInfo = await absoluteVote.voteInfo(proposalId, voterAddress);
  // voteInfo has the following structure
  // int256 vote;
  assert.equal(voteInfo[0].toNumber(), _voteInfo[0]);
  // uint256 reputation;
  assert.equal(voteInfo[1].toNumber(), _voteInfo[1]);
};


export const checkVotesStatus = async function(proposalId, _votesStatus,votingMachine){

  let voteStatus;
  for (var i = 0; i < _votesStatus.length; i++) {
      voteStatus = await votingMachine.voteStatus(proposalId,i);
      assert.equal(voteStatus, _votesStatus[i]);
  }
};

export async function getProposalId(tx,contract,eventName) {
  var proposalId;
  await contract.getPastEvents(eventName, {
            fromBlock: tx.blockNumber,
            toBlock: 'latest'
      })
        .then(function(events){
            proposalId = events[0].args._proposalId;
        });
  return proposalId;
}

// export const increaseTime  = async function (addSeconds) {
//     web3.currentProvider.sendAsync({
//       jsonrpc: '2.0',
//       method: 'evm_increaseTime',
//       params: [addSeconds],
//       id: new Date().getSeconds()
//     }, (err) => {
//       if (!err) {
//         web3.currentProvider.send({
//           jsonrpc: '2.0',
//           method: 'evm_mine',
//           params: [],
//           id: new Date().getSeconds()
//         });
//       }
//     });
//   }
// Increases testrpc time by the passed duration in seconds
export const increaseTime = async function(duration) {
  const id = await Date.now();

   web3.providers.HttpProvider.prototype.sendAsync = web3.providers.HttpProvider.prototype.send;

  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [duration],
      id: id,
    }, err1 => {
      if (err1) return reject(err1);

      web3.currentProvider.sendAsync({
        jsonrpc: '2.0',
        method: 'evm_mine',
        id: id + 1,
      }, (err2, res) => {
        return err2 ? reject(err2) : resolve(res);
      });
    });
  });
};

export const concatBytes = function (bytes1, bytes2) {
  return bytes1 + (bytes2.slice(2));
};

export const getBytesLength = function (bytes) {
  return web3.utils.toBN(Number(bytes.slice(2).length) / 2);
};
