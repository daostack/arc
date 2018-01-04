# DAOStack Documentation

* [Roadmap](roadmap.md)
* [Library Documentation](library/README.md)
* [DAO protocol](DAO-protocol.md)
* [DAO protocol - formal](https://github.com/daostack/daostack/blob/master/docs/dao.pdf)
* [Reference](reference.md)

# About the docs

All documentation lives in `docs` and is served via github pages.
An automatic build process generates `docs/ref/*.md` from files under `contracts/**.sol` as a reference documentation and creates a `reference.md` file from a template under `docs/gen/reference.md.twig`.

### We use:
- [docsify](https://docsify.js.org) as our static site engine. It pulls `.md` files from under `docs/` and makes them look great.
- [twigjs](https://github.com/twigjs/twig.js/wiki) as a templating engine (templates can be found at `docs/gen/*.twig`).
- [solidity-structure](https://www.npmjs.com/package/solidity-structure) to get parsed info out of `.sol` files.

### Commands:
- `npm run docs:build` - builds the the reference docs from `contracts/*/*.sol`.
- `npm run docs:serce` - view the docs locally on your machine, on the url: http://localhost:3000

### Further work:
1. Generate a directory tree instead of a flat list
2. Integrate with travis.
3. Work on the templates.
4. Actually writing some docs.