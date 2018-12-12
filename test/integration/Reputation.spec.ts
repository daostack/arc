import { getContractAddresses, getOptions, getWeb3, sendQuery } from './util';

const Reputation = require('@daostack/arc/build/contracts/Reputation.json');
const UController = require('@daostack/arc/build/contracts/UController.json');

describe('Reputation', () => {
  let web3;
  let addresses;
  let reputation;
  let uController;
  beforeAll(async () => {
    web3 = await getWeb3();
    addresses = getContractAddresses();
    const opts = await getOptions(web3);
    reputation = new web3.eth.Contract(
      Reputation.abi,
      addresses.Reputation,
      opts,
    );
    uController = new web3.eth.Contract(
      UController.abi,
      addresses.UController,
      opts,
    );
  });

  async function checkTotalSupply(value) {
    const { reputationContracts } = await sendQuery(`{
      reputationContracts {
        address,
        totalSupply
      }
    }`);
    expect(reputationContracts).toContainEqual({
      address: reputation.options.address.toLowerCase(),
      totalSupply: parseInt(await reputation.methods.totalSupply().call()) + "",
    });
  }

  it('Sanity', async () => {
    const accounts = web3.eth.accounts.wallet;
    let txs = [];

    txs.push(await reputation.methods.mint(accounts[0].address, '100').send());

    await checkTotalSupply(100);
    txs.push(await reputation.methods.mint(accounts[1].address, '100').send());

    await checkTotalSupply(200);
    txs.push(await reputation.methods.burn(accounts[0].address, '30').send());
    await checkTotalSupply(170);

    txs.push(await reputation.methods.mint(accounts[2].address, '300').send());
    await checkTotalSupply(470);
    txs.push(await reputation.methods.burn(accounts[1].address, '100').send());
    await checkTotalSupply(370);
    txs.push(await reputation.methods.burn(accounts[2].address, '1').send());
    await checkTotalSupply(369);

    txs = txs.map(({ transactionHash }) => transactionHash);

    const { reputationHolders } = await sendQuery(`{
      reputationHolders {
        contract,
        address,
        balance
      }
    }`);

    expect(reputationHolders.length).toBeGreaterThanOrEqual(2);
    expect(reputationHolders).toContainEqual({
      contract: reputation.options.address.toLowerCase(),
      address: accounts[0].address.toLowerCase(),
      balance: parseInt(await reputation.methods.balanceOf(accounts[0].address).call()) + "",
    });
    expect(reputationHolders).toContainEqual({
      contract: reputation.options.address.toLowerCase(),
      address: accounts[2].address.toLowerCase(),
      balance: parseInt(await reputation.methods.balanceOf(accounts[2].address).call()) + "",
    });

    const { reputationMints } = await sendQuery(`{
      reputationMints {
        txHash,
        contract,
        address,
        amount
      }
    }`);

    expect(reputationMints.length).toBeGreaterThanOrEqual(3);
    expect(reputationMints).toContainEqual({
      txHash: txs[0],
      contract: reputation.options.address.toLowerCase(),
      address: accounts[0].address.toLowerCase(),
      amount: '100',
    });
    expect(reputationMints).toContainEqual({
      txHash: txs[1],
      contract: reputation.options.address.toLowerCase(),
      address: accounts[1].address.toLowerCase(),
      amount: '100',
    });
    expect(reputationMints).toContainEqual({
      txHash: txs[3],
      contract: reputation.options.address.toLowerCase(),
      address: accounts[2].address.toLowerCase(),
      amount: '300',
    });

    const { reputationBurns } = await sendQuery(`{
      reputationBurns {
        txHash,
        contract,
        address,
        amount
      }
    }`);

    expect(reputationBurns.length).toBeGreaterThanOrEqual(3);
    expect(reputationBurns).toContainEqual({
      txHash: txs[2],
      contract: reputation.options.address.toLowerCase(),
      address: accounts[0].address.toLowerCase(),
      amount: '30',
    });
    expect(reputationBurns).toContainEqual({
      txHash: txs[4],
      contract: reputation.options.address.toLowerCase(),
      address: accounts[1].address.toLowerCase(),
      amount: '100',
    });
    expect(reputationBurns).toContainEqual({
      txHash: txs[5],
      contract: reputation.options.address.toLowerCase(),
      address: accounts[2].address.toLowerCase(),
      amount: '1',
    });
  }, 100000);
});
