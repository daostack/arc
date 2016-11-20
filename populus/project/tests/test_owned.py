import pytest


def test_sanity(chain, accounts):
    """test simple transfers to and from the token account"""
    own = chain.get_contract('Owned')
    assert own.call().owner() == accounts[0]

    # we can change ownership
    own.transact().transferOwnership(accounts[1])
    assert own.call().owner() == accounts[1]

    # setting the rep from another account should fail
    with pytest.raises(ValueError):
        own.transact().transferOwnership(accounts[2])
    with pytest.raises(ValueError):
        own.transact({'from': accounts[2]}).transferOwnership(accounts[2])

    own.transact({'from': accounts[1]}).transferOwnership(accounts[2])
    assert own.call().owner() == accounts[2]
