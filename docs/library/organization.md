# Organization api

## new

`Organization.new` will deploy a new organization with a standard configuration to
the blockchain. The function returns an `Organization` instance.

    Organization.new({
      orgName: 'xx', // string, required, name of organization
      tokenName: 'xx', // string, required, name of organization's token
      tokenSymbol: 'xxx', // string, required, symbol of organization's token
      founders: [],
      tokensForFounders: [],
      repForFounders: [],
    })

## at

## proposeScheme

Propose to register a new scheme to an existing organization.

    organization.proposeScheme({
      schemeType: ..
      })
