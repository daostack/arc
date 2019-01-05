const helpers = require('./helpers');
const UController = artifacts.require("./UController.sol");
const Reputation = artifacts.require("./Reputation.sol");
const Avatar = artifacts.require("./Avatar.sol");
const DAOToken   = artifacts.require("./DAOToken.sol");
const ERC20Mock = artifacts.require('./ERC20Mock.sol');
const GlobalConstraintMock = artifacts.require('./test/GlobalConstraintMock.sol');
const ActionMock = artifacts.require('./test/ActionMock.sol');
const UniversalSchemeMock = artifacts.require('./test/UniversalSchemeMock.sol');
var constants = require('./constants');
var uint32 = require('uint32');


let reputation, avatar,token,controller;
var amountToMint = 10;

const setup = async function (accounts,permission='0x00000000',registerScheme = accounts[0]) {
  var uController = await UController.new({gas: constants.ARC_GAS_LIMIT});
  token  = await DAOToken.new("TEST","TST",0);
  // set up a reputation system
  reputation = await Reputation.new();
  avatar = await Avatar.new('name', token.address, reputation.address);
  await avatar.transferOwnership(uController.address);
  if (permission !== '0x00000000'){
    await uController.newOrganization(avatar.address,{from:accounts[1]});
    await uController.registerScheme(registerScheme,helpers.NULL_HASH,permission,avatar.address,{from:accounts[1]});
    await uController.unregisterSelf(avatar.address,{from:accounts[1]});
  }
  else {
    await uController.newOrganization(avatar.address);
  }
  return uController;
};

const constraint = async function (method, pre=false, post=false) {
  var globalConstraints = await GlobalConstraintMock.new();
  let globalConstraintsCountOrig = await controller.globalConstraintsCount(avatar.address);
  await globalConstraints.setConstraint(web3.utils.asciiToHex(method),pre,post);
  await controller.addGlobalConstraint(globalConstraints.address,helpers.NULL_HASH,avatar.address);
  let globalConstraintsCount =await controller.globalConstraintsCount(avatar.address);
  assert.equal(globalConstraintsCount[0].toNumber(),globalConstraintsCountOrig[0].toNumber() + (pre ? 0 : 1));
  assert.equal(globalConstraintsCount[1].toNumber(),globalConstraintsCountOrig[1].toNumber() + (post ? 0 : 1));
  return globalConstraints;
};

contract('UController',accounts =>  {

   it("getGlobalConstraintParameters", async() => {
        controller = await setup(accounts);
        // separate cases for pre and post
        var globalConstraints = await constraint("gcParams1", true);
        await controller.addGlobalConstraint(globalConstraints.address,"0x1235",avatar.address);

        var paramsHash = await controller.getGlobalConstraintParameters(globalConstraints.address, avatar.address);

        assert.equal(paramsHash,"0x1235000000000000000000000000000000000000000000000000000000000000");

        globalConstraints = await constraint("gcParams2", false, true);
        await controller.addGlobalConstraint(globalConstraints.address,"0x1236",avatar.address);

        paramsHash = await controller.getGlobalConstraintParameters(globalConstraints.address, avatar.address);

        assert.equal(paramsHash,"0x1236000000000000000000000000000000000000000000000000000000000000");
    });

  it("newOrganization without controller owner of the avatar", async () => {
    var uController = await UController.new({gas: constants.ARC_GAS_LIMIT});
    token  = await DAOToken.new("TEST","TST",0);
    // set up a reputation system
    reputation = await Reputation.new();
    avatar = await Avatar.new('name', token.address, reputation.address);
    try {
      await uController.newOrganization(avatar.address);
      assert(false, 'newOrganization should fail because controller is not the avatar owner');
    } catch (ex) {
      helpers.assertVMException(ex);
    }
  });

  it("newOrganization with same avatar", async () => {
    controller = await  setup(accounts);
    try {
      await controller.newOrganization(avatar.address);
      assert(false, 'trying to call new organization with an avatar which already registered should fail.');
    } catch (ex) {
      helpers.assertVMException(ex);
    }
  });

  it("mint reputation via controller", async () => {
    controller = await  setup(accounts);
    await reputation.transferOwnership(controller.address);
    let tx =  await controller.mintReputation(amountToMint,accounts[0],avatar.address);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "MintReputation");
    assert.equal(tx.logs[0].args._amount, amountToMint);
    assert.equal(tx.logs[0].args._to, accounts[0]);
    let rep = await reputation.balanceOf(accounts[0]);
    assert.equal(rep,amountToMint);
  });

  it("burn reputation via controller", async () => {
    controller = await  setup(accounts);
    await reputation.transferOwnership(controller.address);
    await controller.mintReputation(amountToMint,accounts[0],avatar.address);
    let tx =  await controller.burnReputation(amountToMint-1,accounts[0],avatar.address);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "BurnReputation");
    assert.equal(tx.logs[0].args._amount, amountToMint-1);
    assert.equal(tx.logs[0].args._from, accounts[0]);
    let rep = await reputation.balanceOf(accounts[0]);
    assert.equal(rep,1);
  });

  it("mint tokens via controller", async () => {
    controller = await  setup(accounts);
    await token.transferOwnership(controller.address);
    let tx =  await controller.mintTokens(amountToMint,accounts[0],avatar.address);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "MintTokens");
    assert.equal(tx.logs[0].args._amount, amountToMint);
    let balance =  await token.balanceOf(accounts[0]);
    assert.equal(balance,amountToMint);
  });

  it("register schemes", async () => {
    controller = await  setup(accounts);
    let tx =  await controller.registerScheme(accounts[1], helpers.NULL_HASH,"0x00000000",avatar.address);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "RegisterScheme");
  });

  it("register schemes - check permissions for register new scheme", async () => {
    // Check scheme has at least the permissions it is changing, and at least the current permissions.
    var i,j;
    var controller;
    for(j = 0; j <= 15; j++ ){
      //registered scheme has already permission to register(2)
      controller = await setup(accounts,'0x'+uint32.toHex(j|2));
      var  register;
      for(i = 0; i <= 15; i++ ){
        register = true;
        try {
          await controller.registerScheme(accounts[1],helpers.NULL_HASH,'0x'+uint32.toHex(i),avatar.address);
        } catch (ex) {
          //registered scheme has already permission to register(2) and is register(1).
          assert.notEqual(i&(~(j|3),0));
          register = false;
        }
        if (register){
          await controller.unregisterScheme(accounts[1],avatar.address);
          register= false;
        }
      }
    }
  });

  it("register schemes - check permissions for updating existing scheme", async () => {
    // Check scheme has at least the permissions it is changing, and at least the current permissions.
    controller = await  setup(accounts,'0x0000000F');
    // scheme with permission 0x0000000F should be able to register scheme with permission 0x00000001
    let tx = await controller.registerScheme(accounts[0],helpers.NULL_HASH,"0x00000001",avatar.address);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "RegisterScheme");

    controller = await setup(accounts,'0x00000001');
    try {
      await controller.registerScheme(accounts[0],helpers.NULL_HASH,"0x00000002",avatar.address);
      assert(false, 'scheme with permission 0x00000001 should not be able to register scheme with permission 0x00000002');
    } catch (ex) {
      helpers.assertVMException(ex);
    }
  });

  it("unregister schemes", async () => {
    controller = await  setup(accounts);
    let tx =  await controller.unregisterScheme(accounts[0],avatar.address);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "UnregisterScheme");
  });
  it("unregister none registered scheme", async () => {
    controller = await  setup(accounts);
    let tx =  await controller.unregisterScheme(accounts[1],avatar.address);
    assert.equal(tx.logs.length, 0);
  });

  it("unregister schemes - check permissions unregister scheme", async () => {
    // Check scheme has at least the permissions it is changing, and at least the current permissions.
    //1. setup
    controller = await  setup(accounts);
    //2. account[0] register schemes ,on account[1] with variables permissions which could unregister other schemes.
    var i,j;
    var tx;
    var registeredScheme = accounts[1];
    var unregisteredScheme = accounts[2];
    for(i = 0; i <= 15; i++ ){
      //registered scheme has already permission to register(2)
      tx = await controller.registerScheme(registeredScheme,helpers.NULL_HASH,'0x'+uint32.toHex(i|3),avatar.address);
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "RegisterScheme");
      for(j = 0; j <= 15; j++ ){
        tx = await controller.registerScheme(unregisteredScheme,helpers.NULL_HASH,'0x'+uint32.toHex(j),avatar.address);
        assert.equal(tx.logs.length, 1);
        assert.equal(tx.logs[0].event, "RegisterScheme");
        //try to unregisterScheme
        if (j&(~(i|3))) {
          //unregister should fail
          try {
            await controller.unregisterScheme(unregisteredScheme,avatar.address,{ from: registeredScheme });
            assert(false, "scheme with permission " +uint32.toHex(i|3)+ " should not be able to unregister scheme with permission"+uint32.toHex(j));
          } catch (ex) {
            helpers.assertVMException(ex);
          }
        }else{
          //unregister should succeed
          tx = await controller.unregisterScheme(unregisteredScheme,avatar.address,{ from: registeredScheme });
          assert.equal(tx.logs.length, 1);
          assert.equal(tx.logs[0].event, "UnregisterScheme");
        }
      }
    }
  });

  it("unregister self", async () => {
    var tx;
    controller = await  setup(accounts,"0x00000000");
    tx = await controller.unregisterSelf(avatar.address,{ from: accounts[1]});
    assert.equal(tx.logs.length, 0); // scheme was not registered

    tx = await controller.unregisterSelf(avatar.address);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "UnregisterScheme");
  });

  it("isSchemeRegistered ", async () => {
    var isSchemeRegistered;
    controller = await  setup(accounts,"0x00000000");
    isSchemeRegistered = await controller.isSchemeRegistered(accounts[1],avatar.address);
    assert.equal(isSchemeRegistered, false);
    isSchemeRegistered = await controller.isSchemeRegistered(accounts[0],avatar.address);
    assert.equal(isSchemeRegistered, true);
  });

  it("addGlobalConstraint ", async () => {
    controller = await  setup(accounts);
    var globalConstraints = await constraint("0");
    var tx = await controller.addGlobalConstraint(globalConstraints.address,helpers.NULL_HASH,avatar.address);
    assert.equal(await controller.isGlobalConstraintRegistered(globalConstraints.address,avatar.address),true);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "AddGlobalConstraint");
    var count = await controller.globalConstraintsCount(avatar.address);
    assert.equal(count[0], 1);
  });

  it("removeGlobalConstraint ", async () => {
    controller = await setup(accounts);
    var globalConstraints = await GlobalConstraintMock.new();
    await globalConstraints.setConstraint(web3.utils.asciiToHex("0"),false,false);
    var globalConstraints1 = await GlobalConstraintMock.new();
    await globalConstraints1.setConstraint(web3.utils.asciiToHex("method"),false,false);
    var globalConstraints2 = await GlobalConstraintMock.new();
    await globalConstraints2.setConstraint(web3.utils.asciiToHex("method"),false,false);
    var globalConstraints3 = await GlobalConstraintMock.new();
    await globalConstraints3.setConstraint(web3.utils.asciiToHex("method"),false,false);
    var globalConstraints4 = await GlobalConstraintMock.new();
    await globalConstraints4.setConstraint(web3.utils.asciiToHex("method"),false,false);

    assert.equal(await controller.isGlobalConstraintRegistered(globalConstraints.address,avatar.address),false);
    await controller.addGlobalConstraint(globalConstraints.address,helpers.NULL_HASH,avatar.address);
    await controller.addGlobalConstraint(globalConstraints1.address,helpers.NULL_HASH,avatar.address);
    await controller.addGlobalConstraint(globalConstraints2.address,helpers.NULL_HASH,avatar.address);
    await controller.addGlobalConstraint(globalConstraints3.address,helpers.NULL_HASH,avatar.address);
    await controller.addGlobalConstraint(globalConstraints4.address,helpers.NULL_HASH,avatar.address);
    var tx = await controller.removeGlobalConstraint(globalConstraints2.address,avatar.address);
    assert.equal(tx.logs.length, 2);
    assert.equal(tx.logs[0].event, "RemoveGlobalConstraint");
    assert.equal(await controller.isGlobalConstraintRegistered(globalConstraints.address,avatar.address),true);
    assert.equal(await controller.isGlobalConstraintRegistered(globalConstraints1.address,avatar.address),true);
    assert.equal(await controller.isGlobalConstraintRegistered(globalConstraints2.address,avatar.address),false);
    assert.equal(await controller.isGlobalConstraintRegistered(globalConstraints3.address,avatar.address),true);
    assert.equal(await controller.isGlobalConstraintRegistered(globalConstraints4.address,avatar.address),true);

    let gcCount = await controller.globalConstraintsCount(avatar.address);

    assert.equal(gcCount[0],4);
    assert.equal(gcCount[1],4);

    await controller.removeGlobalConstraint(globalConstraints4.address,avatar.address);
    assert.equal(await controller.isGlobalConstraintRegistered(globalConstraints4.address,avatar.address),false);
    gcCount = await controller.globalConstraintsCount(avatar.address);
    assert.equal(gcCount[0],3);
    assert.equal(gcCount[1],3);
  });

  it("upgrade controller ", async () => {
    controller = await  setup(accounts);

    await reputation.transferOwnership(controller.address);
    await token.transferOwnership(controller.address);
    var tx = await controller.upgradeController(accounts[1],avatar.address);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "UpgradeController");
  });

  it("upgrade controller check permission", async () => {
    controller = await  setup(accounts,'0x00000007');
    await token.transferOwnership(controller.address);
    await reputation.transferOwnership(controller.address);
    try{
      await controller.upgradeController(accounts[1],avatar.address);
      assert(false,"scheme with permission 0x00000007 is not allowed to upgrade ");
    } catch (ex) {
      helpers.assertVMException(ex);
    }
  });

  it("generic call log", async () => {
    controller = await setup(accounts,'0x00000010');
    let actionMock =  await ActionMock.new();
    let a = 7;
    let b = actionMock.address;
    let c = "0x1234";
    const encodeABI = await new web3.eth.Contract(actionMock.abi).methods.test(a,b,c).encodeABI();
    var tx = await controller.genericCall(actionMock.address,encodeABI,avatar.address);
    await avatar.getPastEvents('GenericCall', {
          fromBlock: tx.blockNumber,
          toBlock: 'latest'
      })
      .then(function(events){
          assert.equal(events[0].event,"GenericCall");
          assert.equal(events[0].args._contract,actionMock.address);
      });

  });

  it("generic call", async () => {
    controller = await setup(accounts,'0x00000010');
    let actionMock =  await ActionMock.new();
    let a = 7;
    let b = actionMock.address;
    let c = "0x1234";
    const encodeABI = await new web3.eth.Contract(actionMock.abi).methods.test(a,b,c).encodeABI();
    var result = await controller.genericCall.call(actionMock.address,encodeABI,avatar.address);
    assert.equal(result[1], 14);

  });
    it("generic call withoutReturnValue", async () => {
      controller = await setup(accounts,'0x00000010');
      let actionMock =  await ActionMock.new();
      const actionMockContract = await new web3.eth.Contract(actionMock.abi);
      const encodeABI = actionMockContract.methods.withoutReturnValue(avatar.address).encodeABI();
      var tx = await controller.genericCall(actionMock.address,encodeABI,avatar.address);
      await actionMock.getPastEvents('WithoutReturnValue', {
            filter: {_addr: avatar.address}, // Using an array means OR: e.g. 20 or 23
            fromBlock: tx.blockNumber,
            toBlock: 'latest'
        })
        .then(function(events){
            assert.equal(events[0].event,"WithoutReturnValue");
        });
    });

  it("generic call via contract scheme", async () => {
    var scheme = await UniversalSchemeMock.new();
    controller = await setup(accounts,'0x00000010',scheme.address);
    let actionMock =  await ActionMock.new();
    let a = 7;
    let b = actionMock.address;
    let c = "0x1234";
    let result = await scheme.genericCall.call(avatar.address,actionMock.address, a,b,c);
    assert.equal(result[1], 14);

  });

  it("sendEther", async () => {
    controller = await  setup(accounts);
    let otherAvatar = await Avatar.new('otheravatar', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS);
    //send some ether to the avatar
    await web3.eth.sendTransaction({from:accounts[0],to:avatar.address, value: web3.utils.toWei('1', "ether")});
    //send some ether from an organization's avatar to the otherAvatar
    var tx = await controller.sendEther(web3.utils.toWei('1', "ether"),otherAvatar.address,avatar.address);
    await avatar.getPastEvents('SendEther', {
          filter: {_addr: avatar.address}, // Using an array means OR: e.g. 20 or 23
          fromBlock: tx.blockNumber,
          toBlock: 'latest'
      })
      .then(function(events){
          assert.equal(events[0].event,"SendEther");
      });
    var avatarBalance = await web3.eth.getBalance(avatar.address)/web3.utils.toWei('1', "ether");
    assert.equal(avatarBalance, 0);
    var otherAvatarBalance = await web3.eth.getBalance(otherAvatar.address)/web3.utils.toWei('1', "ether");
    assert.equal(otherAvatarBalance, 1);
  });

  it("externalTokenTransfer", async () => {
    //External transfer token from avatar contract to other address
    controller = await  setup(accounts);
    var standardToken = await ERC20Mock.new(avatar.address, 100);
    let balanceAvatar = await standardToken.balanceOf(avatar.address);
    assert.equal(balanceAvatar, 100);
    var tx = await controller.externalTokenTransfer(standardToken.address,accounts[1],50,avatar.address);
    await avatar.getPastEvents('ExternalTokenTransfer', {
          filter: {_addr: avatar.address}, // Using an array means OR: e.g. 20 or 23
          fromBlock: tx.blockNumber,
          toBlock: 'latest'
      })
      .then(function(events){
          assert.equal(events[0].event,"ExternalTokenTransfer");
      });
    balanceAvatar = await standardToken.balanceOf(avatar.address);
    assert.equal(balanceAvatar, 50);
    let balance1 = await standardToken.balanceOf(accounts[1]);
    assert.equal(balance1, 50);
  });

  it("externalTokenTransferFrom & ExternalTokenApproval", async () => {
    var tx;
    var to   = accounts[1];
    controller = await  setup(accounts);
    var standardToken = await ERC20Mock.new(avatar.address, 100);
    tx = await controller.externalTokenApproval(standardToken.address,avatar.address,50,avatar.address);
    await avatar.getPastEvents('ExternalTokenApproval', {
          filter: {_addr: avatar.address}, // Using an array means OR: e.g. 20 or 23
          fromBlock: tx.blockNumber,
          toBlock: 'latest'
      })
      .then(function(events){
          assert.equal(events[0].event,"ExternalTokenApproval");
      });
    tx = await controller.externalTokenTransferFrom(standardToken.address,avatar.address,to,50,avatar.address);

    await avatar.getPastEvents('ExternalTokenTransferFrom', {
          filter: {_addr: avatar.address}, // Using an array means OR: e.g. 20 or 23
          fromBlock: tx.blockNumber,
          toBlock: 'latest'
      })
      .then(function(events){
          assert.equal(events[0].event,"ExternalTokenTransferFrom");
      });
    let balanceAvatar = await standardToken.balanceOf(avatar.address);
    assert.equal(balanceAvatar, 50);
    let balanceTo = await standardToken.balanceOf(to);
    assert.equal(balanceTo, 50);
  });

    it("globalConstraints mintReputation add & remove", async () => {
      controller = await  setup(accounts);
      var globalConstraints = await constraint("mintReputation");
      await reputation.transferOwnership(controller.address);
      try {
      await controller.mintReputation(amountToMint,accounts[0],avatar.address);
      assert(false,"mint reputation should fail due to the global constraint ");
      }
      catch(ex){
        helpers.assertVMException(ex);
      }
      await controller.removeGlobalConstraint(globalConstraints.address,avatar.address);
      var globalConstraintsCount =await controller.globalConstraintsCount(avatar.address);
      assert.equal(globalConstraintsCount[0],0);
      assert.equal(globalConstraintsCount[1],0);
      let tx = await controller.mintReputation(amountToMint,accounts[0],avatar.address);
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "MintReputation");
      assert.equal(tx.logs[0].args._amount, amountToMint);
      let rep = await reputation.balanceOf(accounts[0]);
      assert.equal(rep,amountToMint);
      });

    it("globalConstraints mintTokens add & remove", async () => {

      controller = await  setup(accounts);
      var globalConstraints = await constraint("mintTokens");
      await token.transferOwnership(controller.address);
      try {
      await controller.mintTokens(amountToMint,accounts[0],avatar.address);
      assert(false,"mint tokens should fail due to the global constraint ");
      }
      catch(ex){
        helpers.assertVMException(ex);
      }
      await controller.removeGlobalConstraint(globalConstraints.address,avatar.address);
      var globalConstraintsCount =await controller.globalConstraintsCount(avatar.address);
      assert.equal(globalConstraintsCount[0],0);
      assert.equal(globalConstraintsCount[1],0);
      let tx =  await controller.mintTokens(amountToMint,accounts[0],avatar.address);
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "MintTokens");
      assert.equal(tx.logs[0].args._amount, amountToMint);
      let balance =  await token.balanceOf(accounts[0]);
      assert.equal(balance,amountToMint);
      });

   it("globalConstraints register schemes add & remove", async () => {
      controller = await  setup(accounts);
      var globalConstraints = await constraint("registerScheme");
      try {
      await controller.registerScheme(accounts[1], helpers.NULL_HASH,"0x00000000",avatar.address);
      assert(false,"registerScheme should fail due to the global constraint ");
      }
      catch(ex){
        helpers.assertVMException(ex);
      }
      await controller.removeGlobalConstraint(globalConstraints.address,avatar.address);
      var globalConstraintsCount =await controller.globalConstraintsCount(avatar.address);
      assert.equal(globalConstraintsCount[0],0);
      assert.equal(globalConstraintsCount[1],0);
      let tx =  await controller.registerScheme(accounts[1], helpers.NULL_HASH,"0x00000000",avatar.address);
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "RegisterScheme");
      });

    it("globalConstraints unregister schemes add & remove", async () => {
       controller = await  setup(accounts);
       var globalConstraints = await constraint("registerScheme");
       try {
       await controller.unregisterScheme(accounts[0],avatar.address);
       assert(false,"unregisterScheme should fail due to the global constraint ");
       }
       catch(ex){
         helpers.assertVMException(ex);
       }
       await controller.removeGlobalConstraint(globalConstraints.address,avatar.address);
       var globalConstraintsCount =await controller.globalConstraintsCount(avatar.address);
       assert.equal(globalConstraintsCount[0],0);
       assert.equal(globalConstraintsCount[1],0);
       let tx =  await controller.unregisterScheme(accounts[0],avatar.address);
       assert.equal(tx.logs.length, 1);
       assert.equal(tx.logs[0].event, "UnregisterScheme");
       });

     it("globalConstraints generic call  add & remove", async () => {
        controller = await  setup(accounts,'0x00000014');
        var globalConstraints = await constraint("genericCall");
        let actionMock =  await ActionMock.new();
        let a = 7;
        let b = actionMock.address;
        let c = "0x1234";
        const encodeABI = await new web3.eth.Contract(actionMock.abi).methods.test(a,b,c).encodeABI();
        try {
          await controller.genericCall.call(actionMock.address,encodeABI,avatar.address);
          assert(false,"genericAction should fail due to the global constraint ");
        }
        catch(ex){
          helpers.assertVMException(ex);
        }
        await controller.removeGlobalConstraint(globalConstraints.address,avatar.address);
        var globalConstraintsCount =await controller.globalConstraintsCount(avatar.address);
        assert.equal(globalConstraintsCount[0],0);
        assert.equal(globalConstraintsCount[1],0);
        var tx =  await controller.genericCall(actionMock.address,encodeABI,avatar.address);
        await avatar.getPastEvents('GenericCall', {
              filter: {_addr: avatar.address}, // Using an array means OR: e.g. 20 or 23
              fromBlock: tx.blockNumber,
              toBlock: 'latest'
          })
          .then(function(events){
              assert.equal(events[0].event,"GenericCall");
          });
        });

    it("globalConstraints sendEther  add & remove", async () => {
       controller = await  setup(accounts);
       var globalConstraints = await constraint("sendEther");
       let otherAvatar = await Avatar.new('otheravatar', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS);
       web3.eth.sendTransaction({from:accounts[0],to:avatar.address, value: web3.utils.toWei('1', "ether")});

       try {
        await controller.sendEther(web3.utils.toWei('1', "ether"),otherAvatar.address,avatar.address);
        assert(false,"sendEther should fail due to the global constraint ");
       }
       catch(ex){
         helpers.assertVMException(ex);
       }
       await controller.removeGlobalConstraint(globalConstraints.address,avatar.address);
       var globalConstraintsCount =await controller.globalConstraintsCount(avatar.address);
       assert.equal(globalConstraintsCount[0],0);
       assert.equal(globalConstraintsCount[1],0);
       var tx = await controller.sendEther(web3.utils.toWei('1', "ether"),otherAvatar.address,avatar.address);
       await avatar.getPastEvents('SendEther', {
             filter: {_addr: avatar.address}, // Using an array means OR: e.g. 20 or 23
             fromBlock: tx.blockNumber,
             toBlock: 'latest'
         })
         .then(function(events){
             assert.equal(events[0].event,"SendEther");
        });
       var avatarBalance = await web3.eth.getBalance(avatar.address)/web3.utils.toWei('1', "ether");
       assert.equal(avatarBalance, 0);
       var otherAvatarBalance = await web3.eth.getBalance(otherAvatar.address)/web3.utils.toWei('1', "ether");
       assert.equal(otherAvatarBalance, 1);
       });

     it("globalConstraints externalTokenTransfer  add & remove", async () => {
        controller = await  setup(accounts);
        var globalConstraints = await constraint("externalTokenTransfer");
        var standardToken = await ERC20Mock.new(avatar.address, 100);
        let balanceAvatar = await standardToken.balanceOf(avatar.address);
        assert.equal(balanceAvatar, 100);

        try {
         await controller.externalTokenTransfer(standardToken.address,accounts[1],50,avatar.address);
         assert(false,"externalTokenTransfer should fail due to the global constraint ");
        }
        catch(ex){
          helpers.assertVMException(ex);
        }
        await controller.removeGlobalConstraint(globalConstraints.address,avatar.address);
        var globalConstraintsCount =await controller.globalConstraintsCount(avatar.address);
        assert.equal(globalConstraintsCount[0],0);
        assert.equal(globalConstraintsCount[1],0);
        var tx = await controller.externalTokenTransfer(standardToken.address,accounts[1],50,avatar.address);
        await avatar.getPastEvents('ExternalTokenTransfer', {
              filter: {_addr: avatar.address}, // Using an array means OR: e.g. 20 or 23
              fromBlock: tx.blockNumber,
              toBlock: 'latest'
          })
          .then(function(events){
              assert.equal(events[0].event,"ExternalTokenTransfer");
          });
        balanceAvatar = await standardToken.balanceOf(avatar.address);
        assert.equal(balanceAvatar, 50);
        let balance1 = await standardToken.balanceOf(accounts[1]);
        assert.equal(balance1, 50);
        });

    it("globalConstraints externalTokenTransferFrom , externalTokenApproval", async () => {
       var tx;
       var to   = accounts[1];
       controller = await  setup(accounts);
       var globalConstraints = await constraint("externalTokenApproval");
       var standardToken = await ERC20Mock.new(avatar.address, 100);
       try {
        await controller.externalTokenApproval(standardToken.address,avatar.address,50,avatar.address);
        assert(false,"externalTokenIncreaseApproval should fail due to the global constraint ");
       }
       catch(ex){
         helpers.assertVMException(ex);
       }
       await controller.removeGlobalConstraint(globalConstraints.address,avatar.address);
       var globalConstraintsCount =await controller.globalConstraintsCount(avatar.address);
       assert.equal(globalConstraintsCount[0],0);
       assert.equal(globalConstraintsCount[1],0);

       tx = await controller.externalTokenApproval(standardToken.address,avatar.address,50,avatar.address);
       await avatar.getPastEvents('ExternalTokenApproval', {
             filter: {_addr: avatar.address}, // Using an array means OR: e.g. 20 or 23
             fromBlock: tx.blockNumber,
             toBlock: 'latest'
         })
         .then(function(events){
             assert.equal(events[0].event,"ExternalTokenApproval");
         });
       globalConstraints = await constraint("externalTokenTransferFrom");
       try {
        await controller.externalTokenTransferFrom(standardToken.address,avatar.address,to,50,avatar.address);
        assert(false,"externalTokenTransferFrom should fail due to the global constraint ");
       }
       catch(ex){
         helpers.assertVMException(ex);
       }
       await controller.removeGlobalConstraint(globalConstraints.address,avatar.address);
       globalConstraintsCount =await controller.globalConstraintsCount(avatar.address);
       assert.equal(globalConstraintsCount[0],0);
       });
});
