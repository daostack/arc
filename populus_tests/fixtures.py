import pytest

@pytest.fixture
def reputation(chain, accounts):
    # create a Reputation contract and seed it
    rep = chain.get_contract('Reputation')
    rep.transact().set_reputation(accounts[0], 20000)
    rep.transact().set_reputation(accounts[1], 10000)
    rep.transact().set_reputation(accounts[2], 3141)
    return rep


@pytest.fixture
def ballot(chain, accounts, reputation):
    # create a ballot
    ballot = chain.get_contract('NamedProposalBallot', deploy_kwargs={
        'reputationContractAddress': reputation.address,
        'proposalNames': ['y', 'n']
    })
    return ballot


@pytest.fixture
def token(chain, accounts, reputation):
    # create a new Token
    kwargs = {
        '_initialAmount': 100,
        }

    token = chain.get_contract('Token', deploy_kwargs=kwargs)
    return token


@pytest.fixture
def mintable_token(chain, accounts, reputation):
    # create a new Token
    kwargs = {
        '_initialAmount': 100,
        }

    token = chain.get_contract('MintableToken', deploy_kwargs=kwargs)
    return token
