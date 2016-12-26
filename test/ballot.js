const assertJump = require('./zeppelin-solidity/helpers/assertJump');

contract('Test Ballot', function(accounts) {
  it("should implement basic voting workflow", async function() {

    // create a reputation contract
    var reputation = Reputation.deployed()
    await reputation.setReputation(accounts[0], 1000);
    await reputation.setReputation(accounts[1], 1000);
    await reputation.setReputation(accounts[2], 1000);

    // create a ballot
    let ballot = await NamedProposalBallot.new(reputation.address, ['y', 'n'])
    await ballot.vote(0, {'from': accounts[0]})
    await ballot.vote(1, {'from': accounts[1]})
    await ballot.vote(1, {'from': accounts[2]})

    // proposals got 1000 and 2000 votes respectively
    let proposal0 = await ballot.proposals(0)
    let proposal1 = await ballot.proposals(1)
    assert.equal(proposal0[1].valueOf(),  1000)
    assert.equal(proposal1[1].valueOf(),  2000)

    // winningProposal returns the index of the winning proposal
    let winningProposal  = await ballot.winningProposal()
    assert.equal(winningProposal, 1)
  })

  it('voting twice should throw an error', async function() {
    var reputation = Reputation.deployed()
    let ballot = await NamedProposalBallot.new(reputation.address, ['y', 'n'])
    await ballot.vote(0, {'from': accounts[0]})
    try {
      await ballot.vote(0, {'from': accounts[0]})
      throw 'an exception';
    } catch(error) {
        assertJump(error);
    }

  })

  it('an unknown voter can vote, but it will have no effect', async function(){
    var reputation = Reputation.deployed()
    let ballot = await NamedProposalBallot.new(reputation.address, ['y', 'n'])
    await ballot.vote(1, {'from': accounts[8]})
    let proposal1 = await ballot.proposals(1)
    assert.equal(proposal1[1].valueOf(),  0)
  })

  it('voting for an unknown proposal raises an error', async function() {
    var reputation = Reputation.deployed()
    let ballot = await NamedProposalBallot.new(reputation.address, ['y', 'n'])
    try {
      await ballot.vote(1234, {'from': accounts[0]})
      throw 'an exception';
    } catch(error) {
        assertJump(error);
    };
  });

// def test_vote_not_reached_quorum(chain, accounts):
//     pass

});
