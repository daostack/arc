import pytest


def test_sanity(chain):
    """test setting and getting reputation by the owner"""
    rep = chain.get_contract('Reputation') #, deploy_kwargs=kwargs)

    accounts = chain.web3.eth.accounts
    assert rep.call().owner() == accounts[0]
    rep.transact().set_reputation(accounts[1], 10000)
    rep.transact().set_reputation(accounts[2], 3141)
    # this should raise an error
    try:
        rep.transact().set_reputation(accounts[2], 3.14)
    except TypeError:
        pass

    assert rep.call().reputationOf(accounts[2]) == 3141

    # setting the rep from another account should fail
    with pytest.raises(ValueError):
        rep.transact(transaction={'from': accounts[3]}).set_reputation(accounts[3], 1234)


        