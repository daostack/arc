import {
  getContractAddresses,
  getOptions,
  getWeb3,
  hashLength,
  nullParamsHash,
  padZeros,
  sendQuery,
} from './util';

const Avatar = require('@daostack/arc/build/contracts/Avatar.json');
const DAOToken = require('@daostack/arc/build/contracts/DAOToken.json');
const Reputation = require('@daostack/arc/build/contracts/Reputation.json');
const TokenCapGC = require('@daostack/arc/build/contracts/TokenCapGC.json');
const UController = require('@daostack/arc/build/contracts/UController.json');

describe('UController', () => {
  let web3;
  let addresses;
  let opts;
  let uController;
  let reputation;
  let daoToken;
  beforeAll(async () => {
    web3 = await getWeb3();
    addresses = getContractAddresses();
    opts = await getOptions(web3);
    uController = new web3.eth.Contract(
      UController.abi,
      addresses.UController,
      opts,
    );
    reputation = new web3.eth.Contract(
      Reputation.abi,
      addresses.NativeReputation,
      opts,
    );
    daoToken = new web3.eth.Contract(DAOToken.abi, addresses.NativeToken, opts);
  });

  it('Sanity', async () => {
    const accounts = web3.eth.accounts.wallet;
    const avatar = await new web3.eth.Contract(Avatar.abi, undefined, opts)
      .deploy({
        data: Avatar.bytecode,
        arguments: [
          'Test',
          daoToken.options.address,
          reputation.options.address,
        ],
      })
      .send();

    const tokenCap1 = await new web3.eth.Contract(
      TokenCapGC.abi,
      undefined,
      opts,
    )
      .deploy({ data: TokenCapGC.bytecode, arguments: [] })
      .send();

    const tokenCap2 = await new web3.eth.Contract(
      TokenCapGC.abi,
      undefined,
      opts,
    )
      .deploy({ data: TokenCapGC.bytecode, arguments: [] })
      .send();

    await avatar.methods.transferOwnership(uController.options.address).send();
    let txs = [];
    txs.push(
      await uController.methods.newOrganization(avatar.options.address).send(),
    );
    txs.push(
      await uController.methods
        .registerScheme(
          accounts[2].address,
          '0x' + padZeros('123', hashLength),
          '0x' + padZeros('7', 8),
          avatar.options.address,
        )
        .send(),
    );
    txs.push(
      await uController.methods
        .addGlobalConstraint(
          tokenCap1.options.address,
          '0x' + padZeros('987', hashLength),
          avatar.options.address,
        )
        .send(),
    );
    txs.push(
      await uController.methods
        .registerScheme(
          accounts[3].address,
          '0x' + padZeros('321', hashLength),
          '0x' + padZeros('8', 8),
          avatar.options.address,
        )
        .send(),
    );
    txs.push(
      await uController.methods
        .addGlobalConstraint(
          tokenCap2.options.address,
          '0x' + padZeros('789', hashLength),
          avatar.options.address,
        )
        .send(),
    );
    txs.push(
      await uController.methods
        .unregisterScheme(accounts[3].address, avatar.options.address)
        .send(),
    );
    txs.push(
      await uController.methods
        .removeGlobalConstraint(
          tokenCap2.options.address,
          avatar.options.address,
        )
        .send(),
    );
    txs = txs.map(({ transactionHash }) => transactionHash);

    const { ucontrollerRegisterSchemes } = await sendQuery(`{
      ucontrollerRegisterSchemes {
        txHash,
        controller,
        contract,
        avatarAddress,
        scheme
      }
    }`);

    expect(ucontrollerRegisterSchemes).toContainEqual({
      txHash: txs[0],
      controller: uController.options.address.toLowerCase(),
      contract: accounts[0].address.toLowerCase(),
      avatarAddress: avatar.options.address.toLowerCase(),
      scheme: accounts[0].address.toLowerCase(),
    });
    expect(ucontrollerRegisterSchemes).toContainEqual({
      txHash: txs[1],
      controller: uController.options.address.toLowerCase(),
      contract: accounts[0].address.toLowerCase(),
      avatarAddress: avatar.options.address.toLowerCase(),
      scheme: accounts[2].address.toLowerCase(),
    });
    expect(ucontrollerRegisterSchemes).toContainEqual({
      txHash: txs[3],
      controller: uController.options.address.toLowerCase(),
      contract: accounts[0].address.toLowerCase(),
      avatarAddress: avatar.options.address.toLowerCase(),
      scheme: accounts[3].address.toLowerCase(),
    });

    const { ucontrollerUnregisterSchemes } = await sendQuery(`{
      ucontrollerUnregisterSchemes {
        txHash
        controller
        contract
        avatarAddress
        scheme
      }
    }`);

    expect(ucontrollerUnregisterSchemes).toContainEqual({
      txHash: txs[5],
      controller: uController.options.address.toLowerCase(),
      contract: accounts[0].address.toLowerCase(),
      avatarAddress: avatar.options.address.toLowerCase(),
      scheme: accounts[3].address.toLowerCase(),
    });

    const { ucontrollerOrganizations } = await sendQuery(`{
      ucontrollerOrganizations {
        avatarAddress
        nativeToken {
          address
        }
        nativeReputation {
          address
        }
        controller
      }
    }`);

    expect(ucontrollerOrganizations).toContainEqual({
      avatarAddress: avatar.options.address.toLowerCase(),
      nativeToken: { address: daoToken.options.address.toLowerCase() },
      nativeReputation: { address: reputation.options.address.toLowerCase() },
      controller: uController.options.address.toLowerCase(),
    });

    const { ucontrollerSchemes } = await sendQuery(`{
      ucontrollerSchemes {
        avatarAddress
        address
        paramsHash
        canRegisterSchemes
        canManageGlobalConstraints
        canUpgradeController
        canDelegateCall
      }
    }`);

    expect(ucontrollerSchemes).toContainEqual({
      avatarAddress: avatar.options.address.toLowerCase(),
      address: accounts[0].address.toLowerCase(),
      paramsHash: nullParamsHash,
      canRegisterSchemes: true,
      canManageGlobalConstraints: true,
      canUpgradeController: true,
      canDelegateCall: true,
    });
    expect(ucontrollerSchemes).toContainEqual({
      avatarAddress: avatar.options.address.toLowerCase(),
      address: accounts[2].address.toLowerCase(),
      paramsHash: '0x' + padZeros('123', hashLength),
      canRegisterSchemes: true,
      canManageGlobalConstraints: true,
      canUpgradeController: null,
      canDelegateCall: null,
    });

    const { ucontrollerAddGlobalConstraints } = await sendQuery(`{
      ucontrollerAddGlobalConstraints {
        txHash,
        controller,
        avatarAddress,
        globalConstraint,
        paramsHash,
        type
      }
    }`);

    expect(ucontrollerAddGlobalConstraints.length).toEqual(2);
    expect(ucontrollerAddGlobalConstraints).toContainEqual({
      txHash: txs[2],
      controller: uController.options.address.toLowerCase(),
      avatarAddress: avatar.options.address.toLowerCase(),
      globalConstraint: tokenCap1.options.address.toLowerCase(),
      paramsHash: '0x' + padZeros('987', hashLength),
      type: 'Post',
    });
    expect(ucontrollerAddGlobalConstraints).toContainEqual({
      txHash: txs[4],
      controller: uController.options.address.toLowerCase(),
      avatarAddress: avatar.options.address.toLowerCase(),
      globalConstraint: tokenCap2.options.address.toLowerCase(),
      paramsHash: '0x' + padZeros('789', hashLength),
      type: 'Post',
    });

    const { ucontrollerRemoveGlobalConstraints } = await sendQuery(`{
      ucontrollerRemoveGlobalConstraints {
        txHash,
        controller,
        avatarAddress,
        globalConstraint,
        isPre
      }
    }`);

    expect(ucontrollerRemoveGlobalConstraints.length).toEqual(1);
    expect(ucontrollerRemoveGlobalConstraints).toContainEqual({
      txHash: txs[6],
      controller: uController.options.address.toLowerCase(),
      avatarAddress: avatar.options.address.toLowerCase(),
      globalConstraint: tokenCap2.options.address.toLowerCase(),
      isPre: null,
    });
    //
    const { ucontrollerGlobalConstraints } = await sendQuery(`{
      ucontrollerGlobalConstraints {
        avatarAddress,
        address,
        paramsHash,
        type
      }
    }`);

    expect(ucontrollerGlobalConstraints.length).toEqual(1);
    expect(ucontrollerGlobalConstraints).toContainEqual({
      avatarAddress: avatar.options.address.toLowerCase(),
      address: tokenCap1.options.address.toLowerCase(),
      paramsHash: '0x' + padZeros('987', hashLength),
      type: 'Post',
    });

    txs.push(
      (await uController.methods
        .upgradeController(accounts[4].address, avatar.options.address)
        .send()).transactionHash,
    );

    const { ucontrollerUpgradeControllers } = await sendQuery(`{
      ucontrollerUpgradeControllers {
        txHash,
        controller,
        avatarAddress,
        newController
      }
    }`);

    expect(ucontrollerUpgradeControllers.length).toEqual(1);
    expect(ucontrollerUpgradeControllers).toContainEqual({
      txHash: txs[7],
      controller: uController.options.address.toLowerCase(),
      avatarAddress: avatar.options.address.toLowerCase(),
      newController: accounts[4].address.toLowerCase(),
    });

    const {
      ucontrollerOrganizations: ucontrollerOrganizations2,
    } = await sendQuery(`{
      ucontrollerOrganizations {
        avatarAddress
        nativeToken {
          address
        }
        nativeReputation {
          address
        }
        controller
      }
    }`);

    expect(ucontrollerOrganizations2).toContainEqual({
      avatarAddress: avatar.options.address.toLowerCase(),
      nativeToken: { address: daoToken.options.address.toLowerCase() },
      nativeReputation: { address: reputation.options.address.toLowerCase() },
      controller: accounts[4].address.toLowerCase(),
    });
  }, 20000);
});
