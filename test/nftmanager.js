const helpers = require("./helpers");
const GenericScheme = artifacts.require("./GenericScheme.sol");
const ERC20Mock = artifacts.require("./ERC20Mock.sol");
const ERC721Mock = artifacts.require("./ERC721Mock.sol");
const IERC721ReceiverMock = artifacts.require("./IERC721ReceiverMock.sol");
const IERC721NonReceiverMock = artifacts.require("./IERC721NonReceiverMock");
const NFTManager = artifacts.require("./NFTManager.sol");

class GenericSchemeParams {
  constructor() {}
}

const VotingMachines = {
  GenesisProtocol: 'genesisProtocol',
  AbsoluteVote: 'absoluteVote'
};

var registration;
const setupGenericSchemeParams = async function(
  accounts,
  genesisProtocol,
  token,
  avatarAddress,
  contractToCall
) {
  var genericSchemeParams = new GenericSchemeParams();

  if (genesisProtocol === true) {
    genericSchemeParams.votingMachine = await helpers.setupGenesisProtocol(
      accounts,
      token,
      helpers.NULL_ADDRESS
    );
    genericSchemeParams.initdata = await new web3.eth.Contract(
      registration.genericScheme.abi
    ).methods
      .initialize(
        avatarAddress,
        genericSchemeParams.votingMachine.genesisProtocol.address,
        genericSchemeParams.votingMachine.uintArray,
        genericSchemeParams.votingMachine.voteOnBehalf,
        helpers.NULL_HASH,
        contractToCall
      )
      .encodeABI();
  } else {
    genericSchemeParams.votingMachine = await helpers.setupAbsoluteVote(
      helpers.NULL_ADDRESS,
      50
    );
    genericSchemeParams.initdata = await new web3.eth.Contract(
      registration.genericScheme.abi
    ).methods
      .initialize(
        avatarAddress,
        genericSchemeParams.votingMachine.absoluteVote.address,
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        helpers.NULL_ADDRESS,
        genericSchemeParams.votingMachine.params,
        contractToCall
      )
      .encodeABI();
  }
  return genericSchemeParams;
};

const setup = async function(
  accounts,
  contractToCall = 0,
  reputationAccount = 0,
  genesisProtocol = false,
  tokenAddress = 0
) {
  var testSetup = new helpers.TestSetup();
  testSetup.standardTokenMock = await ERC20Mock.new(accounts[1], 100);
  registration = await helpers.registerImplementation();
  testSetup.reputationArray = [20, 10, 70];
  var account2;
  if (reputationAccount === 0) {
    account2 = accounts[2];
  } else {
    account2 = reputationAccount;
  }
  testSetup.proxyAdmin = accounts[5];
  testSetup.org = await helpers.setupOrganizationWithArraysDAOFactory(
    testSetup.proxyAdmin,
    accounts,
    registration,
    [accounts[0], accounts[1], account2],
    [1000, 0, 0],
    testSetup.reputationArray
  );
  testSetup.genericSchemeParams = await setupGenericSchemeParams(
    accounts,
    genesisProtocol,
    tokenAddress,
    testSetup.org.avatar.address,
    contractToCall
  );

  var permissions = "0x0000001f";
  var tx = await registration.daoFactory.setSchemes(
    testSetup.org.avatar.address,
    [web3.utils.fromAscii("GenericScheme")],
    testSetup.genericSchemeParams.initdata,
    [helpers.getBytesLength(testSetup.genericSchemeParams.initdata)],
    [permissions],
    "metaData",
    { from: testSetup.proxyAdmin }
  );
  testSetup.genericScheme = await GenericScheme.at(tx.logs[1].args._scheme);
  return testSetup;
};

const setupAndExecuteProposal = async (accounts, nftManager, callData, votingMachine) => {
    var standardTokenMock = await ERC20Mock.new(accounts[0], 1000);
    var testSetup = await setup(
      accounts,
      nftManager.address,
      0,
      votingMachine === VotingMachines.AbsoluteVote ? false : true,
      standardTokenMock.address
    );

    await nftManager.transferOwnership(testSetup.org.avatar.address);

    var tx = await testSetup.genericScheme.proposeCall(
      callData,
      0,
      helpers.NULL_HASH
    );
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId");
    // transfer some eth to avatar
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: testSetup.org.avatar.address,
      value: web3.utils.toWei("1", "ether"),
    });

    tx = await testSetup.genericSchemeParams.votingMachine[votingMachine].vote(
      proposalId,
      1,
      0,
      helpers.NULL_ADDRESS,
      { from: accounts[2] }
    );

    if (votingMachine === VotingMachines.GenesisProtocol) {
      await testSetup.genericScheme
      .getPastEvents("ProposalExecutedByVotingMachine", {
        fromBlock: tx.blockNumber,
        toBlock: "latest",
      })
      .then(function(events) {
        assert.equal(events[0].event, "ProposalExecutedByVotingMachine");
        assert.equal(events[0].args._param, 1);
      });
    }
};

const encodeSendNFTCall = async function(
  _recipient,
  _nftContract,
  _tokenId,
  _actionMock
) {
  return await new web3.eth.Contract(_actionMock.abi).methods
    .sendNFT(_recipient, _nftContract, _tokenId)
    .encodeABI();
  // Change tottran
};

const encodeSendNFTWithDataCall = async function(
  _recipient,
  _nftContract,
  _tokenId,
  _data,
  _actionMock
) {
  return await new web3.eth.Contract(_actionMock.abi).methods
    .sendNFTWithData(_recipient, _nftContract, _tokenId, _data)
    .encodeABI();
  // Change tottran
};


const encodeSendNFTNoSafeGaurdsCall = async function(
  _recipient,
  _nftContract,
  _tokenId,
  _actionMock
) {
  return await new web3.eth.Contract(_actionMock.abi).methods
    .sendNFTNoSafeguards(_recipient, _nftContract, _tokenId)
    .encodeABI();
  // Change tottran
};

const assertEventParams = (event, params, expectedParams) => {
  for (let i = 0; i < params.length; i++) {
    expect(event.args[params[i]].toString()).to.be.equal(expectedParams[i].toString());
  }
};

const setupNFT = async (owner, nftMinter, nftSender) => {
  const nftMock = await ERC721Mock.new({ from: nftMinter });
  await nftMock.__ERC721Mock_initialize({ from: nftMinter });

  const nftManager = await NFTManager.new({ from: owner });
  await nftManager.initialize({ from: owner });

  await nftMock.mint(nftManager.address, 0, { from: nftMinter });
  await nftMock.mint(nftSender, 1, { from: nftMinter });

  const nftReceiverMock = await IERC721ReceiverMock.new({ from: nftMinter });

  return {
    nftManager,
    nftMock,
    nftReceiverMock,
  };
};

const sendNFTData = "0x12345";

contract("NFTManager", function(accounts) {
  before(function() {
    helpers.etherForEveryone(accounts);
  });

  it("NFT Manager is owned by owner", async function() {
    const [owner, nftMinter, nftSender] = accounts;
    const { nftManager } = await setupNFT(owner, nftMinter, nftSender);

    const actualOwner = await nftManager.owner();
    expect(actualOwner).to.be.eq(owner);
  });

  it("Valid NFT transfer succeeds when sent by owner, via raw transaction", async function() {
    const [owner, nftMinter, nftSender, nftRecipient] = accounts;
    const { nftManager, nftMock } = await setupNFT(owner, nftMinter, nftSender);
    const tokenId = 0;

    const call = await encodeSendNFTNoSafeGaurdsCall(
      nftRecipient,
      nftMock.address,
      tokenId,
      nftManager
    );
    await NFTManager.web3.eth.sendTransaction({
      from: owner,
      data: call,
      to: nftManager.address,
    });

    // Verify it's success (the NFT is owned by nftRecipient)
    const actualOwner = await nftMock.ownerOf(tokenId);
    expect(actualOwner).to.be.eq(nftRecipient);
  });

  it("Valid NFT transfer succeeds when sent by owner, via abi call", async function() {
    const [owner, nftMinter, nftSender, nftRecipient] = accounts;
    const { nftManager, nftMock } = await setupNFT(owner, nftMinter, nftSender);
    const tokenId = 0;

    await nftManager.sendNFTNoSafeguards(
      nftRecipient,
      nftMock.address,
      tokenId,
      {
        from: owner,
      }
    );

    // Verify it's success (the NFT is owned by nftRecipient)
    const actualOwner = await nftMock.ownerOf(tokenId);
    expect(actualOwner).to.be.eq(nftRecipient);
  });

  it("Valid NFT transfer fails when sent by non-owner", async function() {
    const [owner, nftMinter, nftSender, nftRecipient] = accounts;
    const { nftManager, nftMock } = await setupNFT(owner, nftMinter, nftSender);
    const tokenId = 0;

    try {
      await nftManager.sendNFTNoSafeguards(
        nftRecipient,
        nftMock.address,
        tokenId,
        {
          from: nftRecipient,
        }
      );
    } catch (error) {
      expect(!!error.message, true, "Error message not received");
      return;
    }
    expect.fail("Transaction should fail when sent by non owner");
  });

  it("Valid NFT safeTransfer w/o data succeeds when sent by owner", async function() {
    const [owner, nftMinter, nftSender, nftRecipient] = accounts;
    const { nftManager, nftMock } = await setupNFT(owner, nftMinter, nftSender);
    const tokenId = 0;

    await nftManager.sendNFT(nftRecipient, nftMock.address, tokenId, {
      from: owner,
    });

    // Verify it's success (the NFT is owned by nftRecipient)
    const actualOwner = await nftMock.ownerOf(tokenId);
    expect(actualOwner).to.be.eq(nftRecipient);
  });

  it("Valid NFT safeTransfer w/o data fails when sent by non-owner", async function() {
    const [owner, nftMinter, nftSender, nftRecipient] = accounts;
    const { nftManager, nftMock } = await setupNFT(owner, nftMinter, nftSender);
    const tokenId = 0;

    try {
      await nftManager.sendNFT(nftRecipient, nftMock.address, tokenId, {
        from: nftRecipient,
      });
    } catch (error) {
      expect(!!error.message, true, "Error message not received");
      return;
    }
    expect.fail("Transaction should fail when sent by non owner");
  });

  it("Valid NFT safeTransfer w/o data to smart contract succeeds when the recipient implements IERC721Reciever", async function() {
    const [owner, nftMinter, nftSender] = accounts;
    const { nftManager, nftMock, nftReceiverMock } = await setupNFT(
      owner,
      nftMinter,
      nftSender
    );
    const tokenId = 0;

    await nftManager.sendNFT(
      nftReceiverMock.address,
      nftMock.address,
      tokenId,
      {
        from: owner,
      }
    );

    // Verify it's success (the NFT is owned by nftRecipient)
    const actualOwner = await nftMock.ownerOf(tokenId);
    expect(actualOwner).to.be.eq(nftReceiverMock.address);
  });

  it("Valid NFT safeTransfer w/o data to smart contract fails when the recipient does not implement IERC721Reciever", async function() {
    const [owner, nftMinter, nftSender, nftRecipient] = accounts;
    const { nftManager, nftMock } = await setupNFT(owner, nftMinter, nftSender);
    const nftNonReceiverMock = await IERC721NonReceiverMock.new({
      from: nftMinter,
    });
    const tokenId = 0;

    try {
      await nftManager.sendNFT(
        nftNonReceiverMock.address,
        nftMock.address,
        tokenId,
        {
          from: nftRecipient,
        }
      );
    } catch (error) {
      expect(!!error.message, true, "Error message not received");
      return;
    }
    expect.fail(
      "Transaction should fail when recipient contract does not implement IERC721Reciever"
    );
  });

  it("Valid NFT safeTransfer with data succeeds when sent by owner", async function() {
    const [owner, nftMinter, nftSender, nftRecipient] = accounts;
    const { nftManager, nftMock } = await setupNFT(owner, nftMinter, nftSender);
    const tokenId = 0;

    await nftManager.sendNFTWithData(
      nftRecipient,
      nftMock.address,
      tokenId,
      sendNFTData,
      {
        from: owner,
      }
    );

    // Expect data in event
    const events = await nftManager.getPastEvents("SendNFT", {});
    assertEventParams(
      events[0],
      ["recipient", "nftContract", "tokenId"],
      [nftRecipient, nftMock.address, tokenId]
    );

    // Verify it's success (the NFT is owned by nftRecipient)
    const actualOwner = await nftMock.ownerOf(tokenId);
    expect(actualOwner).to.be.eq(nftRecipient);
  });

  it("Valid NFT safeTransfer with data fails when sent by non-owner", async function() {
    const [owner, nftMinter, nftSender, nftRecipient] = accounts;
    const { nftManager, nftMock } = await setupNFT(owner, nftMinter, nftSender);
    const tokenId = 0;

    try {
      await nftManager.sendNFTWithData(
        nftRecipient,
        nftMock.address,
        tokenId,
        sendNFTData,
        {
          from: nftRecipient,
        }
      );
    } catch (error) {
      expect(!!error.message, true, "Error message not received");
      return;
    }
    expect.fail("Transaction should fail when sent by non owner");
  });

  it("Valid NFT safeTransfer with data to smart contract succeeds when the recipient implements IERC721Reciever", async function() {
    const [owner, nftMinter, nftSender] = accounts;
    const { nftManager, nftMock, nftReceiverMock } = await setupNFT(
      owner,
      nftMinter,
      nftSender
    );
    const tokenId = 0;

    await nftManager.sendNFTWithData(
      nftReceiverMock.address,
      nftMock.address,
      tokenId,
      sendNFTData,
      {
        from: owner,
      }
    );

    // Expect data in event
    const events = await nftManager.getPastEvents("SendNFT", {});
    assertEventParams(
      events[0],
      ["recipient", "nftContract", "tokenId"],
      [nftReceiverMock.address, nftMock.address, tokenId]
    );

    // Verify it's success (the NFT is owned by nftRecipient)
    const actualOwner = await nftMock.ownerOf(tokenId);
    expect(actualOwner).to.be.eq(nftReceiverMock.address);
  });

  it("Valid NFT safeTransfer with data to smart contract fails when the recipient does not implement IERC721Reciever", async function() {
    const [owner, nftMinter, nftSender, nftRecipient] = accounts;
    const { nftManager, nftMock, nftNonReceiverMock } = await setupNFT(
      owner,
      nftMinter,
      nftSender
    );
    const tokenId = 0;

    try {
      await nftManager.sendNFTWithData(
        nftNonReceiverMock.address,
        nftMock.address,
        tokenId,
        sendNFTData,
        {
          from: nftRecipient,
        }
      );
    } catch (error) {
      expect(!!error.message, true, "Error message not received");
      return;
    }
    expect.fail(
      "Transaction should fail when recipient contract does not implement IERC721Reciever"
    );
  });

  it("NFTManager gracefully accepts NFTs sent using safeTransfer()", async function() {
    const [owner, nftMinter, nftSender] = accounts;
    const { nftManager, nftMock } = await setupNFT(owner, nftMinter, nftSender);
    const tokenId = 1;

    //Safe Transfer NFT to NFTManager
    const tx = await nftMock.safeTransferFrom(
      nftSender,
      nftManager.address,
      tokenId,
      { from: nftSender }
    );

    //Ensure transfer completes as expected
    const transferLog = tx.logs.find((log) => log.event === "Transfer");
    expect(transferLog.args.from).to.be.equal(nftSender);
    expect(transferLog.args.to).to.be.equal(nftManager.address);
    expect(transferLog.args.tokenId.toString()).to.be.equal(tokenId.toString());

    const actualOwner = await nftMock.ownerOf(tokenId);
    expect(actualOwner).to.be.eq(nftManager.address);
  });

  it("proposeCall log", async function() {
    const [owner, nftMinter, nftSender, nftRecipient] = accounts;
    const { nftManager, nftMock } = await setupNFT(owner, nftMinter, nftSender);

    var testSetup = await setup(accounts, nftManager.address);
    await nftManager.transferOwnership(testSetup.org.avatar.address);
    var callData = await encodeSendNFTNoSafeGaurdsCall(
      nftRecipient,
      nftMock.address,
      0,
      nftManager
    );
    var tx = await testSetup.genericScheme.proposeCall(
      callData,
      0,
      helpers.NULL_HASH
    );
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "NewCallProposal");
  });

  it("sendNFTNoSafeGuards: execute proposeVote -positive decision", async function() {
    const [owner, nftMinter, nftSender, nftRecipient] = accounts;
    const { nftManager, nftMock } = await setupNFT(owner, nftMinter, nftSender);
    const tokenId = 0;

    const callData = await encodeSendNFTNoSafeGaurdsCall(
      nftRecipient,
      nftMock.address,
      0,
      nftManager
    );

    await setupAndExecuteProposal(accounts, nftManager, callData, VotingMachines.AbsoluteVote);

    // Expect data in event
    const events = await nftManager.getPastEvents("SendNFT", {});
    assertEventParams(
      events[0],
      ["recipient", "nftContract", "tokenId"],
      [nftRecipient, nftMock.address, tokenId]
    );

    assert.equal(await nftMock.ownerOf(0), nftRecipient);
  });

  it("sendNFTNoSafeGuards:  execute proposeVote -positive decision - check action - with GenesisProtocol", async function() {
    const [owner, nftMinter, nftSender, nftRecipient] = accounts;
    const { nftManager, nftMock } = await setupNFT(owner, nftMinter, nftSender);
    assert.equal(await nftMock.ownerOf(0), nftManager.address);
    const tokenId = 0;

    const callData = await encodeSendNFTNoSafeGaurdsCall(
      nftRecipient,
      nftMock.address,
      tokenId,
      nftManager
    );

    await setupAndExecuteProposal(accounts, nftManager, callData, VotingMachines.GenesisProtocol);

      // Expect data in event
    const events = await nftManager.getPastEvents("SendNFT", {});
    assertEventParams(
      events[0],
      ["recipient", "nftContract", "tokenId"],
      [nftRecipient, nftMock.address, tokenId]
    );

    assert.equal(await nftMock.ownerOf(0), nftRecipient);
  });

  it("sendNFT: execute proposeVote -positive decision", async function() {
    const [owner, nftMinter, nftSender, nftRecipient] = accounts;
    const { nftManager, nftMock } = await setupNFT(owner, nftMinter, nftSender);
    const tokenId = 0;

    const callData = await encodeSendNFTCall(
      nftRecipient,
      nftMock.address,
      0,
      nftManager
    );

    await setupAndExecuteProposal(accounts, nftManager, callData, VotingMachines.AbsoluteVote);

    // Expect data in event
    const events = await nftManager.getPastEvents("SendNFT", {});
    assertEventParams(
      events[0],
      ["recipient", "nftContract", "tokenId"],
      [nftRecipient, nftMock.address, tokenId]
    );

    assert.equal(await nftMock.ownerOf(0), nftRecipient);
  });

  it("sendNFT:  execute proposeVote -positive decision - check action - with GenesisProtocol", async function() {
    const [owner, nftMinter, nftSender, nftRecipient] = accounts;
    const { nftManager, nftMock } = await setupNFT(owner, nftMinter, nftSender);
    assert.equal(await nftMock.ownerOf(0), nftManager.address);
    const tokenId = 0;

    const callData = await encodeSendNFTCall(
      nftRecipient,
      nftMock.address,
      tokenId,
      nftManager
    );

    await setupAndExecuteProposal(accounts, nftManager, callData, VotingMachines.GenesisProtocol);

      // Expect data in event
    const events = await nftManager.getPastEvents("SendNFT", {});
    assertEventParams(
      events[0],
      ["recipient", "nftContract", "tokenId"],
      [nftRecipient, nftMock.address, tokenId]
    );

    assert.equal(await nftMock.ownerOf(0), nftRecipient);
  });

  it("sendNFTWithData: execute proposeVote -positive decision", async function() {
    const [owner, nftMinter, nftSender, nftRecipient] = accounts;
    const { nftManager, nftMock } = await setupNFT(owner, nftMinter, nftSender);
    const tokenId = 0;

    const callData = await encodeSendNFTWithDataCall(
      nftRecipient,
      nftMock.address,
      tokenId,
      '0x12345',
      nftManager
    );

    await setupAndExecuteProposal(accounts, nftManager, callData, VotingMachines.AbsoluteVote);

    // Expect data in event
    const events = await nftManager.getPastEvents("SendNFT", {});
    assertEventParams(
      events[0],
      ["recipient", "nftContract", "tokenId"],
      [nftRecipient, nftMock.address, tokenId]
    );

    assert.equal(await nftMock.ownerOf(0), nftRecipient);
  });

  it("sendNFTWithData:  execute proposeVote -positive decision - check action - with GenesisProtocol", async function() {
    const [owner, nftMinter, nftSender, nftRecipient] = accounts;
    const { nftManager, nftMock } = await setupNFT(owner, nftMinter, nftSender);
    assert.equal(await nftMock.ownerOf(0), nftManager.address);
    const tokenId = 0;

    const callData = await encodeSendNFTWithDataCall(
      nftRecipient,
      nftMock.address,
      tokenId,
      '0x12345',
      nftManager
    );

    await setupAndExecuteProposal(accounts, nftManager, callData, VotingMachines.GenesisProtocol);

      // Expect data in event
    const events = await nftManager.getPastEvents("SendNFT", {});
    assertEventParams(
      events[0],
      ["recipient", "nftContract", "tokenId"],
      [nftRecipient, nftMock.address, tokenId]
    );

    assert.equal(await nftMock.ownerOf(0), nftRecipient);
  });

});
