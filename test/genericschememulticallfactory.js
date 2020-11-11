import * as helpers from './helpers';

const genericSchemeMultiCallFactory = artifacts.require('./GenericSchemeMultiCall.sol');

const setup = async function () {
   var testSetup = new helpers.TestSetup();
   testSetup.genericSchemeMultiCallFactory = await genericSchemeMultiCallFactory.new();
   return testSetup;
};

contract('genericSchemeMultiCallFactory', function(accounts) {
  before(function() {
    helpers.etherForEveryone(accounts);
  });

  it('initialize', async () => {
    let testSetup = await setup();
    votingMachine = await helpers.setupGenesisProtocol(accounts,tokenAddress,0,helpers.NULL_ADDRESS);

    testSetup.genericSchemeMultiCallFactory.createGenericSchemeMultiCallSimple(
      helpers.SOME_ADDRESS,
      votingMachine.genesisProtocol.address,
      0,
      votingMachine.params,
      [],
      '0x0'
    );
  });

});
