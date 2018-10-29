require("dotenv").config();
process.env = {
  ethereum: "http://127.0.0.1:8545",
  node_http: "http://127.0.0.1:8000/daostack/graphql",
  test_mnemonic:
    "behave pipe turkey animal voyage dial relief menu blush match jeans general",
  ...process.env
};

import * as Web3 from "web3";
import axios from "axios";
import * as HDWallet from "hdwallet-accounts";

const { ethereum, node_http, test_mnemonic } = process.env;

const GenesisProtocol = require("@daostack/arc/build/contracts/GenesisProtocol.json");

const nullAddress = "0x0000000000000000000000000000000000000000";

async function query(q, maxDelay = 500) {
  await new Promise((res, rej) => setTimeout(res, maxDelay));
  const {
    data: { data }
  } = await axios.post(process.env.node_http, {
    query: q
  });

  return data;
}

describe("GenesisProtocol", () => {
  let web3, addresses;
  beforeAll(async () => {
    const config = require("../../config.json");
    addresses = config.addresses;
    web3 = new Web3(ethereum);
    const hdwallet = HDWallet(10, test_mnemonic);
    Array(10)
      .fill(10)
      .map((_, i) => i)
      .forEach(i => {
        const pk = hdwallet.accounts[i].privateKey;
        const account = web3.eth.accounts.privateKeyToAccount(pk);
        web3.eth.accounts.wallet.add(account);
      });
    web3.eth.defaultAccount = web3.eth.accounts.wallet[0].address;
  });

  it(
    "newProposal",
    async () => {
      const gp = new web3.eth.Contract(
        GenesisProtocol.abi,
        addresses.GenesisProtocol,
        {
          from: web3.eth.defaultAccount,
          gas: (await web3.eth.getBlock("latest")).gasLimit - 100000
        }
      );

      const setParams = await gp.methods.setParameters(
        [
          50, //_preBoostedVoteRequiredPercentage
          1814400, //_preBoostedVotePeriodLimit
          259200, //_boostedVotePeriodLimit
          web3.utils.toWei("7"), //_thresholdConstA
          3, //_thresholdConstB
          web3.utils.toWei("0"), //_minimumStakingFee
          86400, //_quietEndingPeriod
          5, //_proposingRepRewardConstA
          5, //_proposingRepRewardConstB
          50, //_stakerFeeRatioForVoters
          1, //_votersReputationLossRatio
          80, //_votersGainRepRatioFromLostRep
          75, //_daoBountyConst
          web3.utils.toWei("100") //_daoBountyLimit
        ],
        web3.eth.defaultAccount //_voteOnBehalf
      );
      const paramsHash = await setParams.call();
      await setParams.send();
      const propose = await gp.methods.propose(
        2,
        paramsHash,
        web3.eth.defaultAccount,
        nullAddress
      );
      const proposalId = await propose.call();
      await propose.send();

      const data = await query(
        `{ proposal(id: "${proposalId}") { id, address, organization, numOfChoices, paramsHash, proposer } }`
      );

      expect(data.proposal).toMatchObject({
        id: proposalId,
        address: gp.options.address.toLowerCase(),
        organization: web3.eth.defaultAccount.toLowerCase(),
        numOfChoices: "2",
        paramsHash,
        proposer: web3.eth.defaultAccount.toLowerCase()
      });
    },
    10000
  );
});
