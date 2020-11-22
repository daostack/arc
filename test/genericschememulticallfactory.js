const helpers = require('./helpers');

const GenericSchemeMultiCall = artifacts.require('./GenericSchemeMultiCall.sol');
const GenericSchemeMultiCallFactory = artifacts.require('./GenericSchemeMultiCallFactory.sol');

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
   testSetup.genericSchemeMultiCallFactory = await GenericSchemeMultiCallFactory.new();
   return testSetup;
};

contract('genericSchemeMultiCallFactory', function(accounts) {
  it('initialize', async () => {
    let testSetup = await setup();
    let votingMachine = await helpers.setupGenesisProtocol(accounts,helpers.SOME_ADDRESS,0,helpers.NULL_ADDRESS);

    for (let i=0; i < 4; i++) {
      let address = await testSetup.genericSchemeMultiCallFactory.createGenericSchemeMultiCallSimple.call(
        helpers.SOME_ADDRESS,
        votingMachine.genesisProtocol.address,
        i,
        (i === 0 ? params[0] : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
        helpers.NULL_ADDRESS,
        (i === 0 ? [helpers.SOME_ADDRESS] : []),
        '0x0'
      );

      await testSetup.genericSchemeMultiCallFactory.createGenericSchemeMultiCallSimple(
        helpers.SOME_ADDRESS,
        votingMachine.genesisProtocol.address,
        i,
        (i === 0 ? params[0] : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
        helpers.NULL_ADDRESS,
        (i === 0 ? [helpers.SOME_ADDRESS] : []),
        '0x0'
      );

      let genericSchemeMultiCall = await GenericSchemeMultiCall.at(address);
      assert.equal(await genericSchemeMultiCall.avatar(), helpers.SOME_ADDRESS);
      assert.equal(await genericSchemeMultiCall.votingMachine(), votingMachine.genesisProtocol.address);
      assert.equal(
        await genericSchemeMultiCall.voteParams(),
        await votingMachine.genesisProtocol.getParametersHash(params[i], helpers.NULL_ADDRESS)
      );
      if (i === 0) {
        assert.notEqual(await genericSchemeMultiCall.schemeConstraints(), helpers.NULL_ADDRESS);
      } else {
        assert.equal(await genericSchemeMultiCall.schemeConstraints(), helpers.NULL_ADDRESS);
      }
    }

    try {
      await testSetup.genericSchemeMultiCallFactory.createGenericSchemeMultiCallSimple(
        helpers.SOME_ADDRESS,
        votingMachine.genesisProtocol.address,
        4,
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        helpers.NULL_ADDRESS,
        [],
        '0x0'
      );
      assert(false, "Vote params type specified does not exist");
    } catch(error) {
      helpers.assertVMException(error);
    }

  });

});
