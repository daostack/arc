# Organization API

## new()

`Organization.new` will deploy a new organization with a standard configuration to
the Blockchain. The function returns an `Organization` instance.

    Organization.new({
      orgName: 'Name of organization', // string, required, name of organization
      tokenName: 'xx', // string, required, name of organization's token
      tokenSymbol: 'xxx', // string, required, symbol of organization's token

      // an array of founders, default is empty array
      founders: [
       { address:  '0x124...',
         tokens: 3.14, // how many tokens will be created and given to this founder
         reputation: 1234, // how much reputaiton will be created and given to this founder
       }
      ],  

      // schemes is an array of schemes; default looks as follows:  
      schemes: [
        {
          contract: 'SchemeRegistrar',
          address: settings.schemeRegistrar,
        },
        {
          contract: 'UpgradeScheme',
          address: settings.upgradeScheme,
        },
        {
          contract: 'GlobalConstraintRegistrar',
          address: settings.globalConstraintRegistrar,
        },
      ],
    })


## at()

Usage:

    Organization.at('0x12345')

## proposeScheme()

Propose to register a new scheme to an existing organization. The parameters depend on the
type of scheme that is registered.

These are the options to propose to adopt the SimpleICO scheme:

    organization.proposeScheme({
      contract: 'SimpleICO',
      address: '0x1245', // address of the scheme to use; default is settings.simpleICO
      params: {
        cap: 100, // uint cap; // Cap in Eth
        price: .001, // uint price; // Price represents Tokens per 1 Eth
        startBlock: 5,// uint startBlock;
        endBlock: 10, // uint endBlock;
        admin: accounts[3], // address admin; // The admin can halt or resume ICO.
        beneficiary: accounts[4], // address beneficiary; // all funds received will be transffered to this address.
      }
    });

While the options to adopt the SimpleContributionScheme are simply:

    organization.proposeScheme({
      contract: 'SimpleContributionScheme',
    });

With all possible options:


    const proposalId = await organization.proposeScheme({
      contract: 'SimpleContributionScheme',
      address: '0x1245', // address of the scheme to use; default is settings.simpleContributionScheme
      params: {
        boolVote: organization.votingMachine, // votingMachine used to accept or reject contributions, default is organizaiton.votingMAchine
        votePrec: 50, // percentage conditions under which a contribution is accepted, default is 50
        orgNativeTokenFee: 0, // fee that is to be paid for proposing a contribution
        schemeTokenFee: 0, // fee that is to be paid for proposing a contribution
      }
    });

## proposeGlobalConstraint()

Proposing a global constraint is simple:

    const proposalId = await organization.proposeGlobalConstraint({
      contract: 'TokenCapGC',
      params: {
        cap: 21e9, // is the cap
      },
    })

Here are some other valid invocations:

    const proposalId = await organization.proposeGlobalConstraint({
      address: tokenCapGC.address,
      paramsHash: tokenCapGCParamsHash,
    })

    const proposalId = await organization.proposeGlobalConstraint({
      contract: 'TokenCapGC',
      paramsHash: tokenCapGCParamsHash,
    })

    const proposalId = await organization.proposeGlobalConstraint({
      contract: 'TokenCapGC',
      params: {
        token: organization.nativeToken(), // is the default
        cap: 21e9, // is the cap
      },
    })

## vote()

The vote function can be used for voting on the `organization.votingMachine`.

    organization.vote(proposalId, true);
    organization.vote(proposalId, false);
