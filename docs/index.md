Detailed contracts documentation can be found [here](reference)

A document which describes the concepts involved can be found [here](concepts.md)

Guides & Recipes can be found [here](guides)

[DAOstack Whitepaper](DAOstack%20White%20Paper%20V1.0.pdf)

### Contributing to Arc Docs
Same as [CONTIBUTING](https://github.com/daostack/Arc/blob/master/CONTRIBUTING.md), with the following extras:

1. Prerequisites:
    * `pip install mkdocs mkdocs-material` - install [mkdocs](http://www.mkdocs.org/) & [mkdocs-material](https://squidfunk.github.io/mkdocs-material/) theme.
2. Structure:
    * `docs/` - contains all the regular static `.md` files.
    * `docs_headers/` - contains static files to be included on top of docs generated with `yarn run docs:build`.
    * `mkdocs.yml` - [mkdocs configuration](http://www.mkdocs.org/user-guide/configuration/) file.
3. Commands:
    * `yarn run docs:build` - generates docs from `.sol` files into `docs/reference/*.md` and the docs website in `site`.
    * `yarn run docs:clean` - cleans all generated docs.
    * `yarn run docs:serve` - build & serve the docs.
    * `yarn run docs:deploy` - build & commit & push docs to `gh-pages` branch so they becomes live.
4. Please provide an `index.md` file in the root of every directory, giving an overview of that directory.
5. In case of missing or incorrect documentation please open an issue with the label `documentation`, indicating the file, line number and any extra details.
