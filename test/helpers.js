/**
    helpers for tests
*/

const Avatar = requireContract('Avatar');
const Controller = requireContract('Controller');
const DAOToken = requireContract("DAOToken");
const GenesisScheme = requireContract("GenesisScheme");
const Reputation = requireContract("Reputation");
const AbsoluteVote = requireContract("AbsoluteVote");

// TODO: Rebuild functions

export const NULL_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';
export const SOME_HASH = '0x1000000000000000000000000000000000000000000000000000000000000000';
export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
export const SOME_ADDRESS = '0x1000000000000000000000000000000000000000';

export class Organization {
  constructor() {
  }

  static async new(opts) {
    // TODO: optimization: we now have all sequantial awaits: parallelize them if possible
    // TODO: estimate gas/ether needed based on given options, check balance of sender, and
    // warn if necessary.
    // TODO: default options need to be extended), cf. https://github.com/daostack/daostack/issues/43
    // TODO: orgName, tokenName and tokenSymbol should be required - implement this
    // QUESTION: should we add options to deploy with existing tokens or rep?
    const settings = await getSettings();

    const defaults = {
        orgName: null,
        tokenName: null,
        tokenSymbol: null,
        founders: [],
        votingMachine: settings.daostackContracts.AbsoluteVote.address,
        votePrec: 50,
        ownerVote: true,
        orgNativeTokenFee: 0, // used for SimpleContributionScheme
        schemeNativeTokenFee: 0, // used for SimpleContributionScheme
        genesisScheme: settings.daostackContracts.GenesisScheme.address,
        schemes: [
          {
            contract: CONTRACT_SCHEMEREGISTRAR,
            address: settings.daostackContracts.SchemeRegistrar.address,
          },
          {
            contract: CONTRACT_UPGRADESCHEME,
            address: settings.daostackContracts.UpgradeScheme.address,
          },
          {
            contract: CONTRACT_GLOBALCONSTRAINTREGISTRAR,
            address: settings.daostackContracts.GlobalConstraintRegistrar.address,
          },
        ],
    };

    const options = dopts(opts, defaults, { allowUnknown: true });

    let tx;

    const genesisScheme = await GenesisScheme.at(options.genesisScheme);

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

    options.avatar = avatarAddress;
    org.avatar = await Avatar.at(options.avatar);
    const controllerAddress = await org.avatar.owner();
    org.controller = await Controller.at(controllerAddress);

    const tokenAddress = await org.controller.nativeToken();
    org.token = await DAOToken.at(tokenAddress);

    const reputationAddress = await org.controller.nativeReputation();
    org.reputation = await Reputation.at(reputationAddress);

    org.votingMachine = await AbsoluteVote.at(options.votingMachine);
    await org.votingMachine.setParameters(org.reputation.address, options.votePrec, options.ownerVote);

    const voteParametersHash = await org.votingMachine.getParametersHash(org.reputation.address, options.votePrec, options.ownerVote);

    // TODO: these are specific configuration options that should be settable in the options above
    let initialSchemesAddresses = [];
    let initialSchemesParams = [];
    let initialSchemesTokenAddresses = [];
    let initialSchemesFees = [];
    let initialSchemesPermissions = [];

    for (let optionScheme of options.schemes) {

        var arcSchemeInfo = settings.daostackContracts[optionScheme.contract];
        var scheme = await arcSchemeInfo.contract.at(optionScheme.address || arcSchemeInfo.address);

        const paramsHash = await scheme.setParams({
          voteParametersHash: voteParametersHash,
          votingMachine: org.votingMachine.address,
          orgNativeTokenFee: options.orgNativeTokenFee,
          schemeNativeTokenFee: options.schemeNativeTokenFee
        });

        initialSchemesAddresses.push(scheme.address);
        initialSchemesParams.push(paramsHash);
        initialSchemesTokenAddresses.push(await scheme.nativeToken());
        initialSchemesFees.push(await scheme.fee());
        initialSchemesPermissions.push(scheme.getDefaultPermissions(/* supply options.permissions here? */));
    }

    // register the schemes with the organization
    await genesisScheme.setInitialSchemes(
      org.avatar.address,
      initialSchemesAddresses,
      initialSchemesParams,
      initialSchemesTokenAddresses,
      initialSchemesFees,
      initialSchemesPermissions,
    );


    // transfer what we need for fees to register the organization at the given schemes
    // TODO: check if we have the funds, if not, throw an exception
    // fee = await org.schemeRegistrar.fee())
    // we must do this after setInitialSchemes, because that one approves the transactions
    // (but that logic shoudl change)
    let token, fee;
    for (let i=0; i < initialSchemesAddresses.length; i = i + 1) {
      scheme = await SchemeRegistrar.at(initialSchemesAddresses[i]);
      token = await DAOToken.at(initialSchemesTokenAddresses[i]);
      fee  = initialSchemesFees[i];
      await token.transfer(org.avatar.address, fee);
      await scheme.registerOrganization(org.avatar.address);
    }

    return org;
  }

  async schemes(contract) {
    // return the schemes registered on this controller satisfying the contract spec
    // return all schems if contract is not given
    const schemes = await this._getSchemes();
    if (contract) {
      return schemes.filter(function(s) { return s.contract === contract; });
  } else {
      return schemes;
    }
  }

  async _getSchemes() {
    // private method returns all registered schemes.
    // TODO: this is *expensive*, we need to cache the results (and perhaps poll for latest changes if necessary)
    let result = [];
    const controller = this.controller;
    const settings = await getSettings();

    // TODO: only subscribe to registerScheme events that are registering to this.controller.address
    const registerSchemeEvent = controller.RegisterScheme({}, {fromBlock: 0, toBlock: 'latest'});

    const logs = await promisify.cb_func()(function(cb) { registerSchemeEvent.get(cb); })();
    registerSchemeEvent.stopWatching();

    // get scheme address from the logs
    const addresses = logs.map(function(log) { return log.args._scheme;});
    let permissions, i, scheme;

    // we derive the type of scheme from its permissions, which is at most approximate.
    for (i=0; i < addresses.length; i++) {
        permissions = await controller.getSchemePermissions(addresses[i]);

        scheme = {
          address: addresses[i],
          permissions: permissions,
        };

        if (parseInt(permissions) === 0) {
            // contract = 'unregistered' - we ignore it
        // } else if ((parseInt(permissions) & SCHEME_PERMISSION_REGISTERING) === SCHEME_PERMISSION_REGISTERING) {
        } else if (addresses[i] === String(settings.daostackContracts.SchemeRegistrar.address)) {
            scheme['contract'] = CONTRACT_SCHEMEREGISTRAR;
            result.push(scheme);
        // } else if ((parseInt(permissions) & SCHEME_PERMISSION_UPGRADE) === SCHEME_PERMISSION_UPGRADE) {
        } else if (addresses[i] === String(settings.daostackContracts.UpgradeScheme.address)) {
            scheme['contract'] = CONTRACT_UPGRADESCHEME;
            result.push(scheme);
        // } else if ((parseInt(permissions) & SCHEME_PERMISSION_GLOBALCONSTRAINT) === SCHEME_PERMISSION_GLOBALCONSTRAINT) {
        } else if (addresses[i] === String(settings.daostackContracts.GlobalConstraintRegistrar.address)) {
            scheme['contract'] = CONTRACT_GLOBALCONSTRAINTREGISTRAR;
            result.push(scheme);
        } else if (addresses[i] === String(settings.daostackContracts.SimpleContributionScheme.address)) {
            scheme['contract'] = CONTRACT_SIMPLECONTRIBUTIONSCHEME;
            result.push(scheme);
        } else {
            scheme['contract'] = null;
            result.push(scheme);
        }
    }
    return result;
  }

  async scheme(contract) {
    // returns the schemes can be used to register other schemes
    // TODO: error handling: throw an error if such a schem does not exist, and also if there is more htan one
    const settings = await getSettings();
    const contractInfo = settings.daostackContracts[contract];
    // check if indeed the registrar is registered as a scheme on  the controller
    // const isSchemeRegistered = await this.controller.isSchemeRegistered(contractInfo.address);
    // assert.equal(isSchemeRegistered, true, `${contract} is not registered with the controller`);

    return contractInfo.contract.at(contractInfo.address);
  }

  async checkSchemeConditions(scheme) {
    // check if the scheme if ready for usage - i.e. if the org is registered at the scheme and vice versa
    // check if the schems is usable
    // const controller = this.controller;
    const avatar = this.avatar;

    // check if indeed the registrar is registered as a scheme on  the controller
    // const isSchemeRegistered = await controller.isSchemeRegistered(scheme.address);
    // assert.equal(isSchemeRegistered, true, `${contract} is not registered with the controller`);

    // check if the controller is registered (has paid the fee)
    const isControllerRegistered = await scheme.isRegistered(avatar.address);
    if (!isControllerRegistered) {
        const msg = 'The organization is not registered on this schme: ' + contract +  '; ' + contractInfo.address;
        throw new Error(msg);
    }
    return true;
  }

  vote(proposalId, choice, params) {
    // vote for the proposal given by proposalId using this.votingMachine
    // NB: this will not work for proposals using votingMachine's that are not the default one
    return this.votingMachine.vote(proposalId, choice, params);
  }

}

export function getProposalAddress(tx) {
    // helper function that returns a proposal object from the ProposalCreated event
    // in the logs of tx
    assert.equal(tx.logs[0].event, 'ProposalCreated');
    const proposalAddress = tx.logs[0].args.proposaladdress;
    return proposalAddress;
}

export async function getValueFromLogs(tx, arg, eventName, index=0) {
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
    orgName: 'something',
    tokenName: 'token name',
    tokenSymbol: 'TST',
    founders
  };

  const options = Object.assign(defaults, opts);
  // add this there to eat some dog food
  return Organization.new(options);
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

// export function settingsForTest() {
//     // return settings used for testing
//     return getSettings();
//   }
