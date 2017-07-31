import { Organization } from '../lib/organization.js';
import { SimpleContributionScheme } from '../lib/contributionscheme.js';
import * as helpers from './helpers';

const SimpleVote = artifacts.require('./SimpleVote.sol');
const MintableToken = artifacts.require('./MintableToken.sol');
const Avatar = artifacts.require('./Avatar.sol');
const Controller = artifacts.require('./Controller.sol');


contract('SimpleContribution scheme', function(accounts) {

  before(function() {
    helpers.etherForEveryone();
  });

  it("Propose and accept a contribution - complete workflow", async function(){
    let params, paramsHash, tx, proposal;
    const founders = [
      {
        address: accounts[0],
        tokens: 30,
        reputation: 30,
      },
      {
        address: accounts[1],
        tokens: 70,
        reputation: 70,
      },
    ];

    const org = await helpers.forgeOrganization({founders});

    const avatar = org.avatar;
    const controller = org.controller;
    const schemeRegistrar = await org.schemeRegistrar();

    // we creaet a SimpleContributionScheme
    const tokenAddress = await controller.nativeToken();
    const votingMachine = org.votingMachine;

    // create a contribution Scheme
    const contributionScheme = await SimpleContributionScheme.new(
      tokenAddress,
      0, // register with 0 fee
      accounts[0],
    );

    // propose a SimpleContributionScheme
    const proposalId = await org.proposeScheme({
      contract: 'SimpleContributionScheme',
      schemeAddress: contributionScheme.address,
    });
    // this will vote-and-execute
    tx = await votingMachine.vote(proposalId, true, accounts[1], {from: accounts[1]});

    // now our scheme should be registered on the controller
    const schemeFromController = await controller.schemes(contributionScheme.address);
    // we expect to have only the first bit set (it is a registered scheme without nay particular permissions)
    assert.equal(schemeFromController[1], '0x00000001');

    //  Our organization is not registered with the contribution scheme yet at this point
    let orgFromContributionScheme = await contributionScheme.organizations(avatar.address);
    // console.log('orgFromContributionScheme');
    // console.log(orgFromContributionScheme);
    assert.equal(orgFromContributionScheme, false);

    // check if we have the fee to register the contribution
    const contributionSchemeRegisterFee = await contributionScheme.fee();
    // console.log('contributionSchemeRegisterFee: ' + contributionSchemeRegisterFee);
    // our fee is 0, so that's easy  (TODO: write a test with non-zero fees)
    assert.equal(contributionSchemeRegisterFee, 0);

    // now we register it
    await contributionScheme.registerOrganization(avatar.address);

    // is the organization actually registered?
    orgFromContributionScheme = await contributionScheme.organizations(avatar.address);
    // console.log('orgFromContributionScheme after registering');
    assert.equal(orgFromContributionScheme, true);

    // check the configuration for proposing new contributions

    paramsHash = await controller.getSchemeParameters(contributionScheme.address);
    // params are: uint orgNativeTokenFee; bytes32 voteApproveParams; uint schemeNativeTokenFee;         BoolVoteInterface boolVote;
    params = await contributionScheme.parameters(paramsHash);
    // check if they are not trivial - the 4th item should be a valid boolVote address
    assert.notEqual(params[3], '0x0000000000000000000000000000000000000000');
    assert.equal(params[3], votingMachine.address);

    // now we can propose a contribution
    tx = await contributionScheme.submitContribution(
      avatar.address, // Avatar _avatar,
      'a fair play', // string _contributionDesciption,
      0, // uint _nativeTokenReward,
      0, // uint _reputationReward,
      0, // uint _ethReward,
      '0x0008e8314d3f08fd072e06b6253d62ed526038a0', // StandardToken _externalToken, we provide some arbitrary address
      0, // uint _externalTokenReward,
      accounts[2], // address _beneficiary
    );

    // console.log(tx.logs);
    const contributionId = tx.logs[0].args.proposalId;
    // let us vote for it (is there a way to get the votingmachine from the contributionScheme?)
    // this is a minority vote for 'yes'
    // check preconditions for the vote
    proposal = await votingMachine.proposals(contributionId);
    // a propsoal has the following structure
    // 0. address owner;
    // 1. address avatar;
    // 2. ExecutableInterface executable;
    // 3. bytes32 paramsHash;
    // 4. uint yes; // total 'yes' votes
    // 5. uint no; // total 'no' votes
    // MAPPING is skipped in the reutnr value...
    // X.mapping(address=>int) voted; // save the amount of reputation voted by an agent (positive sign is yes, negatice is no)
    // 6. bool opened; // voting opened flag
    // 7. bool ended; // voting had ended flag
    assert.isOk(proposal[6]); // proposal.opened is true
    assert.notOk(proposal[7]); // proposal.Ended is false
    // first we check if our executable (proposal[2]) is indeed the contributionScheme
    assert.equal(proposal[2], contributionScheme.address);

    tx = await votingMachine.vote(contributionId, true, accounts[0], {from: accounts[0]});
    // and this is the majority vote (which will also call execute on the executable
    tx = await votingMachine.vote(contributionId, true, accounts[1], {from: accounts[1]});

    // check if proposal was deleted from contribution Scheme
    proposal = await contributionScheme.proposals(contributionId);
    assert.equal(proposal[0], helpers.NULL_HASH);

    // check if proposal was deleted from voting machine
    proposal = await votingMachine.proposals(contributionId);
    // TODO: proposal is not deleted from voting machine: is that feature or bug?
    // assert.notOk(proposal[6]); // proposal.opened is false

    // TODO: no payments have been made. Write another test for that.

  });


  it('Can set and get parameters', async function() {
      let params;

      // create a contribution Scheme
      const contributionScheme = await SimpleContributionScheme.new(
        helpers.SOME_ADDRESS,
        0, // register with 0 fee
        accounts[0],
      );

      const contributionSchemeParamsHash = await contributionScheme.getParametersHash(
        0,
        0,
        helpers.SOME_HASH,
        helpers.SOME_ADDRESS,
      );

      // these parameters are not registered yet at this point
      params = await contributionScheme.parameters(contributionSchemeParamsHash);
      assert.equal(params[3], '0x0000000000000000000000000000000000000000');

      // register the parameters are registers in the contribution scheme
      await contributionScheme.setParameters(
        0,
        0,
        helpers.SOME_HASH,
        helpers.SOME_ADDRESS,
      );

      params = await contributionScheme.parameters(contributionSchemeParamsHash);
      assert.notEqual(params[3], '0x0000000000000000000000000000000000000000');

    });
});
