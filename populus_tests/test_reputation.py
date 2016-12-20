import pytest


@pytest.fixture
def reputation(chain):
    rep = chain.get_contract('Reputation')
    return rep


def test_sanity(chain, accounts, reputation):
    """test setting and getting reputation by the owner"""

    # the owner of the contract is its creator, accounts[0]
    assert reputation.call().owner() == accounts[0]

    # we can set the reputation of accounts[1] and accounts[2]
    reputation.transact().setReputation(accounts[1], 10000)
    reputation.transact().setReputation(accounts[2], 3141)

    assert reputation.call().reputationOf(accounts[2]) == 3141


def test_type_errors(chain, accounts, reputation):
    # this should raise an error
    try:
        reputation.transact().setReputation(accounts[2], 3.14)
    except TypeError:
        pass


def test_ownership(chain, accounts, reputation):
    # setting the rep from another account should fail
    with pytest.raises(ValueError):
        reputation.transact(transaction={'from': accounts[3]}).setReputation(accounts[3], 1234)
       