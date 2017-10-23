const helpers = require('./helpers');

const DAOToken = artifacts.require("./DAOToken.sol");
const Reputation = artifacts.require("./Reputation.sol");

contract('GenesisScheme', function(accounts) {

    it("founders should get their share in reputation and tokens", async function() {
        // create an organization
        const founders = [
          {
            address: accounts[0],
            tokens: 1,
            reputation: 8,
          },
          {
            address: accounts[1],
            tokens: 2,
            reputation: 13,
          },
          {
            address: accounts[2],
            tokens: 3,
            reputation: 21,
          },
          {
            address: accounts[3],
            tokens: 5,
            reputation: 34,
          },
        ];
        const organization = await helpers.forgeOrganization({founders});
        const controller = organization.controller;

        const reputationAddress = await controller.nativeReputation();
        const reputationInstance = await Reputation.at(reputationAddress);
        const tokenAddress = await controller.nativeToken();
        const tokenInstance = await DAOToken.at(tokenAddress);

        for (let i = 0 ; i < founders.length ; i++ ) {
            let rep = await reputationInstance.reputationOf(founders[i].address);
            // let rep = await genesis.controller.nativeReputation().reputationOf(founders[i]);
            assert.equal(rep.valueOf(), founders[i].reputation, "founder's reputation is not as expected");

            let balance = await tokenInstance.balanceOf(founders[i].address);
            assert.equal(balance.valueOf(), founders[i].tokens, "founder's token is not as expected");
        }

        // check that a non-founder as no reputation or tokens
        let rep = await reputationInstance.reputationOf(accounts[4]);
        assert.equal(rep.valueOf(), 0, "founders reputation is not as expected");
        let balance = await tokenInstance.balanceOf(accounts[4]);
        assert.equal(balance.valueOf(), 0, "founders reputation is not as expected");
    });
});
