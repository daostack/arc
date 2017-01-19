const assertJump = require('../zeppelin-solidity/helpers/assertJump');

contract('Proposal', function(accounts) {
    it("should implement basic voting workflow", async function() {

        // create a reputation contract
        let reputation = await Reputation.new()
        await reputation.setReputation(1000, accounts[0]);
        await reputation.setReputation(1000, accounts[1]);
        await reputation.setReputation(1000, accounts[2]);
        
        // create a proposal
        let proposal = await Proposal.new(reputation.address)
        await proposal.vote(0, {'from': accounts[0]})
        await proposal.vote(1, {'from': accounts[1]})
        await proposal.vote(1, {'from': accounts[2]})

        // proposals got 1000 and 2000 votes respectively
        let proposal0 = await proposal.proposals(0)
        let proposal1 = await proposal.proposals(1)
        // 
        assert.equal(await proposal0[1], 1000)
        assert.equal(await proposal1[1], 2000)

        // winningChoice returns the index of the winning proposal
        let winningChoice  = await proposal.winningChoice()
        assert.equal(winningChoice, 1)
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
        let proposal1 = await proposal.proposals(1)
        assert.equal(await proposal1[1], 0)
        await proposal.vote(1, {'from': accounts[8]})
        proposal1 = await proposal.proposals(1)
        assert.equal(await proposal1[1], 0)
    })

    it('voting for an unknown proposal raises an error', async function() {
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
