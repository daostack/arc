import {
  getContractAddresses,
  getOptions,
  getWeb3,
  hashLength,
  nullParamsHash,
  padZeros,
  sendQuery,
} from './util';

const DAOToken = require('@daostack/arc/build/contracts/DAOToken.json');

describe('DAOToken', () => {
  let web3;
  let addresses;
  let opts;
  let daotoken;
  beforeAll(async () => {
    web3 = await getWeb3();
    addresses = getContractAddresses();
    opts = await getOptions(web3);
    daotoken = new web3.eth.Contract(DAOToken.abi, addresses.NativeToken, opts);
  });

  it('Sanity', async () => {
    const accounts = web3.eth.accounts.wallet;
    let txs = [];

    txs.push(await daotoken.methods.mint(accounts[0].address, '100').send());
    txs.push(await daotoken.methods.mint(accounts[1].address, '100').send());
    txs.push(await daotoken.methods.mint(accounts[1].address, '100').send());
    txs.push(await daotoken.methods.mint(accounts[2].address, '100').send());
    txs.push(await daotoken.methods.burn('1').send());
    txs.push(await daotoken.methods.burn('1').send());
    txs.push(await daotoken.methods.transfer(accounts[3].address, '50').send());
    txs.push(await daotoken.methods.approve(accounts[3].address, '50').send());
    txs.push(
      await daotoken.methods.transferOwnership(accounts[1].address).send(),
    );

    txs = txs.map(({ transactionHash }) => transactionHash);

    const { tokenContracts } = await sendQuery(`{
      tokenContracts {
        address
        totalSupply
        owner
      }
    }`);

    expect(tokenContracts).toContainEqual({
      address: daotoken.options.address.toLowerCase(),
      totalSupply: '398',
      owner: accounts[1].address.toLowerCase(),
    });

    const { tokenHolders } = await sendQuery(`{
      tokenHolders {
        contract
        address
        balance
      }
    }`);

    expect(tokenHolders.length).toEqual(4);
    expect(tokenHolders).toContainEqual({
      contract: daotoken.options.address.toLowerCase(),
      address: accounts[0].address.toLowerCase(),
      balance: '48',
    });

    const { tokenTransfers } = await sendQuery(`{
      tokenTransfers {
        txHash
        contract
        from
        to
        value
      }
    }`);

    expect(tokenTransfers.length).toEqual(7);
    expect(tokenTransfers).toContainEqual({
      txHash: txs[6],
      contract: daotoken.options.address.toLowerCase(),
      from: accounts[0].address.toLowerCase(),
      to: accounts[3].address.toLowerCase(),
      value: '50',
    });
  }, 20000);
});
