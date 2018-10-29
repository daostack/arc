# DAOstack subgraph

DAOstack subgraph for [TheGraph](https://thegraph.com/) project.

## Getting started

1 `git clone https://github.com/daostack/subgraph.git && cd subgraph`

2. `npm install`
3. `npm run configure:<development|mainnet>` - configure the project to use ganache or mainnet via infura.

All npm scripts can be called within a container using `docker-compose` with all dependencies and services set up:

`docker-compose run subgraph -v $(pwd):/usr/app -v /usr/app/node_modules subgraph <command>`

## Commands

1. `configure:mainnet` - configure the project to run against mainnet.
2. `configure:development` - configure the project to run against ganache.
3. `migrate:development` - migrate contracts to ganache and update project configuration.
4. `codegen` - automatically generate abi & type definitions for required contracts.
5. `test` - run integration tests.
6. `deploy` - deploy subgraph.
7. `deploy:watch` - redeploy on file change.

Example: `docker-compose run subgraph -v $(pwd):/usr/app -v /usr/app/node_modules subgraph test` (run intergation tests)

To stop all services: `docker-compose down`

## Exposed endpoints

After running a command with docker-compose, the following endpoints will be exposed on your local machine:

- `http://localhost:8000/daostack` - GraphiQL graphical user interface.
- `http://localhost:8000/daostack/graphql` - GraphQL api endpoint.
- `http://localhost:8001/daostack` - graph-node's websockets endpoint
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

1. Create a mapping file at `src/<contract name>.ts`.
2. Create a test file at `test/integration/<contract name>.spec.ts`.
3. Configure the contract's mainnet address at `ops/config.yaml` under `addresses.<contract name>`.
4. Add the contract to the migration script at the `migrate` function in `ops/index.js`.
5. Add an additional datasource for the new contract at `subgraph.handlebars.yaml`, use `{{addresses.<contract name>}}` in place of the contract address.
