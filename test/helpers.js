/**
    helpers for tests
*/

const Avatar = artifacts.require("./Avatar.sol");
const Controller = artifacts.require("./Controller.sol");
const DAOToken = artifacts.require("./DAOToken.sol");
const GenesisScheme = artifacts.require("./GenesisScheme.sol");
const Reputation = artifacts.require("./Reputation.sol");
const AbsoluteVote = artifacts.require("./AbsoluteVote.sol");

export const NULL_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';
export const SOME_HASH = '0x1000000000000000000000000000000000000000000000000000000000000000';
export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
export const SOME_ADDRESS = '0x1000000000000000000000000000000000000000';

var dopts = require('default-options');


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

  static async new(opts) {
    const defaults = {
        orgName: null,
        tokenName: null,
        tokenSymbol: null,
        founders: [],
        votePrec: 50,
        ownerVote: true,
        initialSchemes: {
            addresses: [],
            params: [],
            permissions: [],
            fees: [],
            feesTokenAddresses: [],
        }
    };

    const options = dopts(opts, defaults, { allowUnknown: true });

    let tx;

    const genesisScheme = await GenesisScheme.deployed();

    tx = await genesisScheme.forgeOrg(
        options.orgName,
        options.tokenName,
        options.tokenSymbol,
        options.founders.map(x => x.address),
        options.founders.map(x => x.tokens),
        options.founders.map(x => x.reputation),
    );
    // get the address of the avatar from the logs
    const avatarAddress = getValueFromLogs(tx, '_avatar');
    let org = new Organization();

    org.tyrantAddress = web3.eth.accounts[5];

    org.avatar = await Avatar.at(avatarAddress);
    const controllerAddress = await org.avatar.owner();
    org.controller = await Controller.at(controllerAddress);

    const tokenAddress = await org.controller.nativeToken();
    org.token = await DAOToken.at(tokenAddress);

    const reputationAddress = await org.controller.nativeReputation();
    org.reputation = await Reputation.at(reputationAddress);

    org.votingMachine = await AbsoluteVote.deployed();
    org.votingMachineParams = await org.votingMachine.setParameters(org.reputation.address, options.votePrec, options.ownerVote);

    // Add the Tyrant
    options.initialSchemes.addresses.unshift(org.tyrantAddress);
    options.initialSchemes.params.unshift(NULL_HASH);
    options.initialSchemes.permissions.unshift("0x0000000F");
    options.initialSchemes.fees.unshift(0);
    options.initialSchemes.feesTokenAddresses.unshift(NULL_ADDRESS);

    // register the schemes with the organization
    await genesisScheme.setSchemes(
      org.avatar.address,
      options.initialSchemes.addresses,
      options.initialSchemes.params,
      options.initialSchemes.feesTokenAddresses,
      options.initialSchemes.fees,
      options.initialSchemes.permissions,
    );

    return org;
  }

  vote(proposalId, choice, params) {
    // vote for the proposal given by proposalId using this.votingMachine
    // NB: this will not work for proposals using votingMachine's that are not the default one
    return this.votingMachine.vote(proposalId, choice, params);
  }

}

export async function forgeOrganization(opts = {}) {
  const founders = [
    {
      address: web3.eth.accounts[0],
      reputation: 1,
      tokens: 1,
    },
    {
      address: web3.eth.accounts[1],
      reputation: 29,
      tokens: 2,
    },
    {
      address: web3.eth.accounts[2],
      reputation: 70,
      tokens: 3,
    },
  ];

  const defaults = {
    orgName: 'test org',
    tokenName: 'test token name',
    tokenSymbol: 'TST',
    founders,
    initialSchemes: {
        addresses: [],
        params: [],
        permissions: [],
        fees: [],
        feesTokenAddresses: [],
    }
  };

  const options = Object.assign(defaults, opts);
  // add this there to eat some dog food
  return await Organization.new(options);
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

export async function etherForEveryone() {
    // give all web3.eth.accounts some ether
    let accounts = web3.eth.accounts;
    for (let i=0; i < 10; i++) {
        await web3.eth.sendTransaction({to: accounts[i], from: accounts[0], value: web3.toWei(0.1, "ether")});
    }
}

export const outOfGasMessage = 'VM Exception while processing transaction: out of gas';

export function assertJumpOrOutOfGas(error) {
    let condition = (
        error.message == outOfGasMessage ||
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

export const setupAbsoluteVote = async function (isOwnedVote=true, precReq=50,reputationAccount=0) {
  var votingMachine = new VotingMachine();
  var accounts = web3.eth.accounts;
  votingMachine.absoluteVote = await AbsoluteVote.new();

  // set up a reputaiton system
  var reputation = await Reputation.new();
  //var avatar = await Avatar.new('name', helpers.NULL_ADDRESS, reputation.address);
  votingMachine.reputationArray = [20, 40 ,70];
  await reputation.mint(accounts[0], votingMachine.reputationArray[0]);
  await reputation.mint(accounts[1], votingMachine.reputationArray[1]);
  if (reputationAccount==0){
    await reputation.mint(accounts[2], votingMachine.reputationArray[2]);
  }else {
    await reputation.mint(reputationAccount, votingMachine.reputationArray[2]);
  }
  // register some parameters
  await votingMachine.absoluteVote.setParameters(reputation.address, precReq, isOwnedVote);
  votingMachine.params = await votingMachine.absoluteVote.getParametersHash(reputation.address, precReq, isOwnedVote);
  return votingMachine;
};

export const setupOrganization = async function (genesisScheme,genesisSchemeOwner,founderToken,founderReputation) {
  var org = new Organization();

  var tx = await genesisScheme.forgeOrg("testOrg","TEST","TST",[genesisSchemeOwner],[founderToken],[founderReputation]);
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
  // int vote;
  assert.equal(voteInfo[0], _voteInfo[0]);
  // uint reputation;
  assert.equal(voteInfo[1], _voteInfo[1]);
};

// export function settingsForTest() {
//     // return settings used for testing
//     return getSettings();
//   }
