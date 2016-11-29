from fixtures import mintable_token, reputation


def test_sanity(chain):
    """test simple transfers to and from the token account"""
    INITIAL_AMOUNT = 10000
    kwargs = {
        '_initialAmount': INITIAL_AMOUNT,
        # '_tokenName': 'Backfeed',
        }

    token = chain.get_contract('MintableToken', deploy_kwargs=kwargs)

    owner_account = chain.web3.eth.defaultAccount
    assert token.call().balanceOf(owner_account) == INITIAL_AMOUNT
    assert token.call().totalSupply() == INITIAL_AMOUNT
    SOME_AMOUNT = 314
    to_account = chain.web3.personal.newAccount(password='some-phrase')
    token.transact().transfer(to_account, SOME_AMOUNT)
    assert token.call().balanceOf(to_account) == SOME_AMOUNT
    assert token.call().balanceOf(owner_account) == INITIAL_AMOUNT - SOME_AMOUNT
    assert token.call().totalSupply() == INITIAL_AMOUNT


def test_mint(chain, mintable_token, accounts):
    mintable_token.transact().mint(3141, accounts[3])
    assert mintable_token.call().balanceOf(accounts[3]) == 3141


def test_overflow(chain):
    # test a contract with an inital humongous amount
    INITIAL_AMOUNT = 2**256 + 999999
    kwargs = {
        '_initialAmount': INITIAL_AMOUNT,
        # '_tokenName': 'Backfeed',
        }

    # deploying with a initial amount more than 2**256 should raise an error error
    try:
        chain.get_contract('Token', deploy_kwargs=kwargs)
    except TypeError:
        pass
