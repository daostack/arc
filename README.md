# DAOstack subgraph

DAOstack subgraph for [TheGraph](https://thegraph.com/) project.

## Getting started

1 `git clone https://github.com/daostack/subgraph.git && cd subgraph`

2. `npm install`
3. `npm run configure:<development|mainnet>` - configure the project to use ganache or mainnet (requires `.env` [configuration](#configuration)) via infura.
4. `npm run codegen` - automatically generate abi and AssemblyScript type definitions required by the project.

All npm scripts can be called within a container using `docker-compose` with all dependencies and services set up:

`npm run docker <command>`

## Commands

1. `configure:mainnet` - configure the project to run against mainnet.
2. `configure:development` - configure the project to run against ganache.
3. `migrate:development` - migrate contracts to ganache and update project configuration.
4. `codegen` - automatically generate abi & type definitions for required contracts.
5. `deploy` - deploy subgraph.
6. `deploy:watch` - redeploy on file change.

To run integration test run  `npm run test`


Docker commands (requires installing [`docker`](https://docs.docker.com/v17.12/install/) and [`docker-compose`](https://docs.docker.com/compose/install/)):

1. `docker <command>` - start a command running inside the docker container. Example: `npm run docker test` (run intergation tests).
2. `docker:stop` - stop all running docker services.
3.  `docker:rebuild <command>` - rebuild the docker container after changes to `package.json`.
4.  `docker:logs <subgraph|graph-node|ganache|ipfs|postgres>` - display logs from a running docker service.

## Exposed endpoints

After running a command with docker-compose, the following endpoints will be exposed on your local machine:

- `http://localhost:8000/by-name/daostack` - GraphiQL graphical user interface.
- `http://localhost:8000/by-name/daostack/graphql` - GraphQL api endpoint.
- `http://localhost:8001/by-name/daostack` - graph-node's websockets endpoint
- `http://localhost:8020` - graph-node's RPC endpoint
- `http://localhost:5001` - ipfs endpoint.
- (if using development) `http://localhost:8545` - ganache RPC endpoint.
- `http://localhost:5432` - postgresql connection endpoint.

## Configuration

This project automatically generates `.yaml` files used by `docker-compose` & `graph-node` based on configuration.
Project configuration lives under: `ops/config.yaml` (public configration), `.env` (secret configuration).

The following `.env` variables can be configured:

- `daostack_mainnet__postgresPassword` - postgres password when running on mainnet (e.g `123`).
- `daostack_mainnet__ethereumProvider` - mainnet web3 provider (e.g `https://mainnet.infura.io/v3/<api key>`)

## Add a new contract tracker

In order to add support for a new contract follow these steps:

1. Create a mapping file at `src/mappings/<contract name>/<contract name>.ts`.
2. Create a test file at `test/integration/<contract name>.spec.ts`.
3. Configure the contract's mainnet address at `ops/config.yaml` under `addresses.<contract name>`.
4. Add the contract to the migration script at the `migrate` function in `ops/index.js`.
5. Add an additional datasource for the new contract at `subgraph.handlebars.yaml`, use `{{addresses.<contract name>}}` in place of the contract address.
6. Add the appropriate grahpql schema for your mapping in `src/mappings/<contract name>.graphql` and register it at `schema.handlebars.graphql` by adding a `{{> <contract name>}}` line.
