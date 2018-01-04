# DAOStack Documentation

* [Roadmap](roadmap.md)
* [Library Documentation](library/README.md)
* [DAO protocol](DAO-protocol.md)
* [DAO protocol - formal](https://github.com/daostack/daostack/blob/master/docs/dao.pdf)

# About the docs

All documentation lives in `docs` and is served via github pages.
An automatic build process generates `docs/ref/*.md` from files under `contracts/**.sol` as a reference documentation

### We use:
- [docsify](https://docsify.js.org) as our static site engine. It pulls `.md` files from under `docs/` and makes them look great.
- [twigjs](https://github.com/twigjs/twig.js/wiki) as a templating engine (template can be found at `docs/template.md.twig`).
- [solidity-structure](https://www.npmjs.com/package/solidity-structure) to get parsed info out of `.sol` files.

### Commands:
- `npm run docs:build` - builds the the reference docs from `contracts/**.sol`.
- `npm run docs:serce` - view the docs locally on your machine, on the url: http://localhost:3000