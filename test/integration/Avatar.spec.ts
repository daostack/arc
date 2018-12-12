import { getContractAddresses, getOptions, getWeb3, sendQuery } from './util';

const Avatar = require('@daostack/arc/build/contracts/Avatar.json');

describe('Avatar', () => {
  let web3;
  let addresses;
  let avatar;
  beforeAll(async () => {
    web3 = await getWeb3();
    addresses = getContractAddresses();
    const opts = await getOptions(web3);
    avatar = new web3.eth.Contract(Avatar.abi, addresses.Avatar, opts);
  });

  it('Sanity', async () => {
    const accounts = web3.eth.accounts.wallet;

    await web3.eth.sendTransaction({
      from: accounts[0].address,
      to: avatar.options.address,
      value: 1,
      gas: 2000000,
      data: '0xABCD',
    });

    const { avatarContracts } = await sendQuery(`{
      avatarContracts {
        id
        address
        name
        nativeToken
        nativeReputation
        balance
        owner
      }
    }`);

    expect(avatarContracts).toContainEqual({
      id: addresses.Avatar.toLowerCase(),
      address: addresses.Avatar.toLowerCase(),
      name: 'Genesis Test',
      nativeToken: addresses.NativeToken.toLowerCase(),
      nativeReputation: addresses.NativeReputation.toLowerCase(),
      balance: '1',
      owner: addresses.UController.toLowerCase(),
    });
  }, 20000);
});
