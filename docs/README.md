# DAOStack Documentation

* [Roadmap](roadmap.md)
* [Library Documentation](library/README.md)
* [DAO protocol](DAO-protocol.md)
* [DAO protocol - formal](https://github.com/daostack/daostack/blob/master/docs/dao.pdf)

# About the docs

We use [docsify](https://docsify.js.org) as our static site engine. It pulls `.md` files from under `docs/` and makes them look great.

An automatic build process generates `docs/ref/*.md` files under `contracts/**.sol` as a reference documentation using [solidity-doc](https://github.com/vitiko/solidity-doc).

- `npm run docs:build` - builds the the reference docs from `contracts/**.sol`.
- `npm run docs:serce` - view the docs locally on your machine, on the url: http://localhost:3000