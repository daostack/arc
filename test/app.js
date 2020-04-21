const helpers = require("./helpers");

var registration;

const setup = async function () {
   var testSetup = new helpers.TestSetup();
   registration = await helpers.registerImplementation();
   return testSetup;
};
contract('App', accounts => {

    it("freez", async function() {
       await setup();
       registration.implementationDirectory.freeze();
       try {
         await registration.
               implementationDirectory.
               setImplementation("Test",registration.fundingRequest.address);
         assert(false, 'cannot setImplementation because it is freezed');
       } catch (ex) {
         helpers.assertVMException(ex);
       }
    });

    it("unsetImplementation", async function() {
       await setup();
       await registration.
             implementationDirectory.
             unsetImplementation("FundingRequest");
      assert.equal(await registration.app.getImplementation(registration.packageName,"FundingRequest"),
                   helpers.NULL_ADDRESS);

    });

    it("unsetPackage", async function() {
       await setup();
       await registration.
             app.
             unsetPackage(registration.packageName);
      assert.equal(await registration.app.getImplementation(registration.packageName,"FundingRequest"),
                   helpers.NULL_ADDRESS);

    });


    it("getLatest", async function() {
       await setup();
       var latest = await registration.packageInstance.getLatest();
       assert.equal(latest.semanticVersion[0],0);
       assert.equal(latest.semanticVersion[1],1);
       assert.equal(latest.semanticVersion[2],0);
       assert.equal(latest.contractAddress,registration.implementationDirectory.address);
       assert.equal(latest.contentURI,helpers.NULL_HASH);
    });


    it("getLatestByMajor", async function() {
       await setup();
       var latest = await registration.packageInstance.getLatestByMajor(0);
       assert.equal(latest.semanticVersion[0],0);
       assert.equal(latest.semanticVersion[1],1);
       assert.equal(latest.semanticVersion[2],0);
       assert.equal(latest.contractAddress,registration.implementationDirectory.address);
       assert.equal(latest.contentURI,helpers.NULL_HASH);
    });

    it("getVersion", async function() {
       await setup();
       var latest = await registration.packageInstance.getVersion([0,1,0]);
       assert.equal(latest.contractAddress,registration.implementationDirectory.address);
       assert.equal(latest.contentURI,helpers.NULL_HASH);
    });

    it("app Create", async function() {
       await setup();
       var tx = await registration.app.create(registration.packageName,
                                                 "FundingRequest",
                                                  accounts[0],
                                                  "0x"
                                                  );
       assert.equal(tx.logs[0].event, "ProxyCreated");

    });

    it("getProvider", async function() {
       await setup();
       var provider = await registration.app.getProvider(registration.packageName);
       assert.equal(registration.implementationDirectory.address, provider);
    });
});
