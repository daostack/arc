import * as helpers from './helpers';

const GenericSchemeMultiCall = artifacts.require('./GenericSchemeMultiCall.sol');
const genericSchemeMultiCallFactory = artifacts.require('./GenericSchemeMultiCall.sol');

const setup = async function (accounts) {
   var testSetup = new helpers.TestSetup();
   testSetup.standardTokenMock = await ERC20Mock.new(accounts[1],100);
   testSetup.genericSchemeMultiCallFactory = await genericSchemeMultiCallFactory.new();
   return testSetup;
};

contract('genericSchemeMultiCallFactory', function(accounts) {
  before(function() {
    helpers.etherForEveryone(accounts);
  });

  it('initialize', async () => {
    let testSetup = await setup(accounts);
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
