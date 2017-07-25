# Organization api

## new

`Organization.new` will deploy a new organization with a standard configuration to
the Blockchain. The function returns an `Organization` instance.

    Organization.new({
      orgName: 'Name of organization', // string, required, name of organization
      tokenName: 'xx', // string, required, name of organization's token
      tokenSymbol: 'xxx', // string, required, symbol of organization's token
      founders: [], // an array of of founders
      tokensForFounders: [], //  an array of amount of tokens that will be minted for each founder
      repForFounders: [], // an array with an amount of rep that will be created for each founder
    })

See

## at

Usage:

    Organization.at('0x12345')

## proposeScheme

Propose to register a new scheme to an existing organization. The parameters depend on the
type of scheme that is registered.

    await organization.proposeScheme({
      schemeType: 'SimpleICO',
      cap: 100, // uint cap; // Cap in Eth
      price: .001, // uint price; // Price represents Tokens per 1 Eth
      startBlock: 5,// uint startBlock;
      endBlock: 10, // uint endBlock;
      admin: accounts[3], // address admin; // The admin can halt or resume ICO.
      etherAddress: accounts[4], // address etherAddress; // all funds received will be transffered to this address.
    });
