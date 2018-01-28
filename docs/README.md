Detailed contracts documentation can be found [here](ref/README.md)

A document which describes the concepts involved can be found [here](concepts.md)

Guides & Recipes can be found [here](guides.md)

[DAOstack Whitepaper](DAOstack%20White%20Paper%20V1.0.pdf)

### Contributing to Arc Docs
Same as above, with the following exceptions:
* All docs are `.md` files that live under `docs/` with the following structure:
    * `ref/` - generated automatic documentation.
    * `headers/` - manual static `.md` headers that are included in the generated `ref/` (headers are included based on their path, which must match the path of the corresponding generated file in `ref/`).
* Use `yarn run docs:generate` to generate docs
* In case of missing or incorrect documentation please open an issue with the label `documentation`, indicating the file, line number and any extra details.
