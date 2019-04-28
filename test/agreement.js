const helpers = require('./helpers');
var AgreementMock = artifacts.require("./AgreementMock.sol");


const setup = async function (accounts, _agreementHash = helpers.SOME_HASH) {
   var testSetup = new helpers.TestSetup();
   testSetup.agreementMock = await AgreementMock.new();
   testSetup.agreementHash = _agreementHash;
   await testSetup.agreementMock.setAgreementHashTest(_agreementHash);
   return testSetup;
};

contract('Agreement', accounts => {
    it("setAgreementHash", async () => {
      let testSetup = await setup(accounts);
      assert.equal(await testSetup.agreementMock.getAgreementHash(),testSetup.agreementHash);
    });

    it("cannot setAgreementHash twice", async () => {
      let testSetup = await setup(accounts);
      try {
        await testSetup.agreementMock.setAgreementHashTest(helpers.NULL_HASH);
        assert(false, "cannot setAgreementHash twice");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("onlyAgree", async () => {
      let testSetup = await setup(accounts);
      await testSetup.agreementMock.test(helpers.SOME_HASH);
      try {
        await testSetup.agreementMock.test(helpers.NULL_HASH);
        assert(false, "onlyAgree");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });
});
