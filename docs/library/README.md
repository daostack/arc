
# DAOSTACK library

Work in progress.

## API

[Organization](organization.md)

## Example Session
[next examples are not all working yet, but this is what is should/could look like]

    import { Organization } from '/path/to/daostack.js';

create an Organization from zero:

    const organization = await Organization.new({
      orgName: 'Skynet',
      tokenName: 'Tokens of skynet',
      tokenSymbol: 'SNT'
    });

Or create an interface for an already existing organization:

    const organization = Organization.at('0xabc123...');

Usually, organizations will have a number of Schemes registered with the organization:

    organization.schemes() // return an array of Scheme objects

This will return an array:

    [
      {
        contract: SchemeRegistrar,
        address: 0x12345,
      },
      ...
    ]

Because (almost always) there will be only one single SchemeRegistrar (or UpgradeScheme, etc),
for each of these types we have a convenient function that will return the single registered scheme
(or an error if there is no such scheme, or if there is more than 1):


    organization.scheme('SchemeRegistrar'); // return the scheme official daostack schemeregistrar
    organization.scheme('UpgradeScheme');
    organization.scheme('GlobalConstraintRegistrar');


We can use our schemeRegistrar to propose to add a new Scheme - say one for making contributions:

    const contributionScheme = ContributionScheme.at('0x12345abc');

    const proposalId = await organization.proposeScheme({
      contract: 'ContributionScheme',
      params: {
        orgNativeTokenFee: 0, // ??
        schemeNativeTokenFee: 0, // ??
        boolVote: '0x12445', // voting machine to use; default is organization.votingMachine
        reputation: '0x1234', // reputation to use, default is organization.reputation
        absPrecReq: 50, // percentage of votes need for accepting a contribution, default is 50
      },
      isRegistering: false, // is the scheme registering: default: false
      tokenFee: 0, // ??
      fee: 0, // ??
      })

I.e. using only default values, this will look like:

    const proposalId = await organization.proposeScheme({ contract: 'ContributionScheme'});

Proposing a scheme will do lots of checkes, set parameters in various places, register things here and there.

Now we can vote for the scheme:

    organization.vote(proposalId, true);

Once it is accepted, it should show up in `organization.schemes()`, and we can start adding contributions,
for example, we'd like 101 organization tokens for writing documentation:

    const contributionId = contributionScheme.submitContribution({
      organization: organization,
      description: 'Documentation for daostack',
      nativeTokenReward: 101,
    });

Again, we can vote for it (directly on the organization? that would be nice:)

  organization.vote(contributionId, false);
