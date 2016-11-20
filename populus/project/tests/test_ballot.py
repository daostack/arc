import pytest
from fixtures import reputation, ballot


def test_sanity(chain, accounts, reputation, ballot):

    ballot.transact({'from': accounts[0]}).vote(0)
    ballot.transact({'from': accounts[1]}).vote(1)
    ballot.transact({'from': accounts[2]}).vote(1)

    assert ballot.call().winningProposal() == 0
    assert ballot.call().proposals(0) == [u'y\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00', 20000]
    assert ballot.call().proposals(1) == [u'n\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00', 13141]


def test_double_voting(chain, accounts, reputation, ballot):
    # voting twice should throw an error
    ballot.transact({'from': accounts[0]}).vote(1)
    with pytest.raises(ValueError):
        ballot.transact({'from': accounts[0]}).vote(1)

    # test for the limit case when the proposal index is 0
    ballot.transact({'from': accounts[1]}).vote(0)
    with pytest.raises(ValueError):
        ballot.transact({'from': accounts[1]}).vote(0)


def test_unknown_voters(chain, accounts, reputation, ballot):
    # an unknown voter can vote, but her vote will have no effect
    assert ballot.call().proposals(1)[1] == 0
    ballot.transact({'from': accounts[4]}).vote(1)
    assert ballot.call().proposals(1)[1] == 0


def test_vote_uknown_proposal(chain, accounts, reputation, ballot):
    # an unknown voter
    with pytest.raises(ValueError):
        ballot.transact({'from': accounts[0]}).vote(3141)


def test_vote_not_reached_quorum(chain, accounts):
    pass
