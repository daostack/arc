const helpers = require('./helpers');

const Competition = artifacts.require('./Competition.sol');
const ContributionRewardExt = artifacts.require('./ContributionRewardExt.sol');
const CompetitionFactory = artifacts.require('./CompetitionFactory.sol');

const params = [
  [
    50,
    1800,
    600,
    600,
    2000,
    300,
    web3.utils.toWei('5', "ether"),
    1,
    web3.utils.toWei('10', "ether"),
    10,
    0
  ],
  [
    50,
    604800,
    129600,
    43200,
    1200,
    86400,
    web3.utils.toWei('10', "ether"),
    1,
    web3.utils.toWei('50', "ether"),
    10,
    0
  ],
  [
    50,
    2592000,
    345600,
    86400,
    1200,
    172800,
    web3.utils.toWei('50', "ether"),
    4,
    web3.utils.toWei('150', "ether"),
    10,
    0
  ],
  [
    50,
    5184000,
    691200,
    172800,
    1500,
    345600,
    web3.utils.toWei('200', "ether"),
    4,
    web3.utils.toWei('500', "ether"),
    10,
    0
  ]
];

const setup = async function () {
   var testSetup = new helpers.TestSetup();
   testSetup.competitionFactory = await CompetitionFactory.new();
   return testSetup;
};

contract('competitionFactory', function(accounts) {
  it('initialize', async () => {
    let testSetup = await setup();
    let votingMachine = await helpers.setupGenesisProtocol(accounts,helpers.SOME_ADDRESS,0,helpers.NULL_ADDRESS);

    for (let i=0; i < 4; i++) {
      let addresses = await testSetup.competitionFactory.createCompetition.call(
        helpers.SOME_ADDRESS,
        votingMachine.genesisProtocol.address,
        i,
        (i === 0 ? params[0] : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
        helpers.NULL_ADDRESS
      );

      let competitionAddress = addresses['0'];
      let creAddress = addresses['1'];

      await testSetup.competitionFactory.createCompetition(
        helpers.SOME_ADDRESS,
        votingMachine.genesisProtocol.address,
        i,
        (i === 0 ? params[0] : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
        helpers.NULL_ADDRESS
      );

      let contributionRewardExt = await ContributionRewardExt.at(creAddress);
      let competition = await Competition.at(competitionAddress);
      assert.equal(await contributionRewardExt.avatar(), helpers.SOME_ADDRESS);
      assert.equal(await contributionRewardExt.votingMachine(), votingMachine.genesisProtocol.address);
      assert.equal(
        await contributionRewardExt.voteParams(),
        await votingMachine.genesisProtocol.getParametersHash(params[i], helpers.NULL_ADDRESS)
      );
      assert.equal(await contributionRewardExt.rewarder(), competitionAddress);
      assert.equal(await competition.contributionRewardExt(), creAddress);
    }

    try {
      await testSetup.competitionFactory.createCompetition(
        helpers.SOME_ADDRESS,
        votingMachine.genesisProtocol.address,
        4,
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        helpers.NULL_ADDRESS,
      );
      assert(false, "Vote params type specified does not exist");
    } catch(error) {
      helpers.assertVMException(error);
    }

  });

});
