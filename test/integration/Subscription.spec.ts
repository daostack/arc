import { createSubscriptionObservable,
         getContractAddresses,
         getOptions,
         getWeb3,
       } from './util';

const Reputation = require('@daostack/arc/build/contracts/Reputation.json');
const gql = require('graphql-tag');

describe('Subscriptions', () => {
    let web3;
    let addresses;
    let opts;
    let reputation;
    beforeAll(async () => {
        web3 = await getWeb3();
        addresses = getContractAddresses();
        opts = await getOptions(web3);
        reputation = new web3.eth.Contract(Reputation.abi, addresses.Reputation, opts);
    });
    it('Reputation Mint', async () => {
        const accounts = web3.eth.accounts.wallet;
        const SUBSCRIBE_QUERY = gql`
        subscription  {
          reputationMints {
            contract
            amount
            address
          }
        }
        `;

        const subscriptionClient = await createSubscriptionObservable(
          SUBSCRIBE_QUERY,                              // Subscription query
          // {address: accounts[0].address.toLowerCase()} // Query variables
        );

        let event;

        const consumer = await subscriptionClient.subscribe((eventData) => {
        // Do something on receipt of the event
        event = eventData.data.reputationMints;
      }, (err) => {
         expect(true).toEqual(false);
      });

        await reputation.methods.mint(accounts[4].address, '99').send();

      // //wait a second
        await new Promise((res) => setTimeout(res, 1000));

        expect(event).toContainEqual({
          address: accounts[4].address.toLowerCase(),
          amount: '99',
          contract: reputation.options.address.toLowerCase(),
        });

        consumer.unsubscribe();

    }, 2500);
});
