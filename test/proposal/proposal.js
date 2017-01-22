const assertJump = require('../zeppelin-solidity/helpers/assertJump');

contract('Proposal', function(accounts) {
    it("should implement basic voting workflow", async function() {
        // create a reputation contract
        let reputation = await Reputation.new()
        let token = await MintableToken.new()
        let dao = await DAO.new(reputation.address)
        await reputation.setReputation(1000, accounts[0]);
        await reputation.setReputation(1000, accounts[1]);
        await reputation.setReputation(1000, accounts[2]);
        
        // create a proposal
        let proposal = await Proposal.new(reputation.address)
        await proposal.vote(0, {'from': accounts[0]})
        await proposal.vote(1, {'from': accounts[1]})
        await proposal.vote(1, {'from': accounts[2]})

        // choices got 1000 and 2000 votes respectively
        let choice0 = await proposal.choices(0)
        let choice1 = await proposal.choices(1)
         
        assert.equal(await choice0[1], 1000)
        assert.equal(await choice1[1], 2000)

        // winningChoice returns the index of the winning choice
        let winningChoice  = await proposal.winningChoice()
        assert.equal(winningChoice, 1)
    })

    it('vote 0 is "n" and vote 1 is "y"', async function() {
        let proposal = await Proposal.new()

        let choice0 = await proposal.choices(0)
        let choice1 = await proposal.choices(1)
         
        // TODO: make the commented assertions truel
        let padded_hex_n = '0x6e0000000000000000000000000000000000000000000000000000000000000'
        // assert.equal(choice0[0], padded_hex_n)

        let padded_hex_y = '0x790000000000000000000000000000000000000000000000000000000000000'
        // assert.equal(choice1[0], padded_hex_y)
    })

 
    it('voting twice should throw an error', async function() {
        let reputation = await Reputation.new()
        let proposal = await Proposal.new(reputation.address)
        await proposal.vote(0, {'from': accounts[0]})
        try {
          await proposal.vote(0, {'from': accounts[0]})
          throw 'an exception';
        } catch(error) {
            assertJump(error);
        }
    })

    it('an unknown voter can vote, but it will have no effect', async function(){
        let reputation = await Reputation.new()
        let proposal = await Proposal.new(reputation.address)
        let choice1 = await proposal.choices(1)
        assert.equal(await choice1[1], 0)
        await proposal.vote(1, {'from': accounts[8]})
        choice1 = await proposal.choices(1)
        assert.equal(await choice1[1], 0)
    })

    it('voting for an unknown choice raises an error', async function() {
        let reputation = await Reputation.new()
        let proposal = await Proposal.new(reputation.address)
        try {
          await proposal.vote(1234, {'from': accounts[0]})
          throw 'an exception';
        } catch(error) {
            assertJump(error);
        };
    });

});
