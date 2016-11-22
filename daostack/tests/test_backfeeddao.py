from fixtures import mintable_token, reputation


def test_sanity(chain, accounts, mintable_token, reputation):
    """runs through basic actions of deploying, configurring, and interacting with a DCO"""
    # a dco is first initialized with only minimal parameters
    kwargs = {
        'tokenContractAddress': mintable_token.address,
        'reputationContractAddress': reputation.address,

    }
    dco = chain.get_contract('BackfeedDCO', deploy_kwargs=kwargs)

    # we know have a DCO contract that is controlled by the reputation contract
    # 
    # accounts[0] has more than 50% of the votes, and so can force lots of things
    # but first, let's add a Ballot for giving some newly minted tokens to accounts[3]

    ballot = chain.get_contract('BallotMintTokens', deploy_kwargs={
        'reputationContractAddress': reputation.address,
        'tokenContractAddress': mintable_token.address,
        'beneficaryAddress': accounts[3],
        })


    # the winning proposal mints 10 new tokens and gives them to accounts[3]
    ballot.transact().executeWinningProposal()

    # assert mintable_token.call().balanceOf(accounts[3]) == 10


def test_reputation_assigning_by_vote(chain):
    pass