# daostack-subgraph
A DAOstack subgraph for graph-node

# Get started

Develop locally:

1. `npm i` - install dependencies.
2. `npm run codegen` - generate automatic typings.
3. create a `.env` file with the following environment variables (**should be kept secret**):
  - `POSTGRES_PASSWORD` - a secret string used as the PostgreSQL password for the created DB.
  - `ETHEREUM` - url to an rpc ethereum node prefixed with the network name (e.g. `mainnet:http://localhost:8545`)
  - `GRAPH_MASTER_TOKEN` - a secret string used as the master token for the graph-node.
4. (in a seperate terminal) `docker-compose up` ([install](https://docs.docker.com/compose/install/)) - run a local graph-node with the above config.
5. `npm run authorize` - authorize with the graph-node in order to be able to deploy subgraphs.
6. `npm run deploy`/`npm run deploy:watch` - deploy the subgraph.

Note: All persistent data for the node will be stored in the `./data` directory, remove this directory in order to reset the node.

Exposed endpoints:
- `http://localhost:8000/daostack` - GraphQL API.
- `http://localhost:8020` - graph-node RPC server.
- `postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/postgres` - postgres DB connection.
- `http://localhost:5001` - ipfs node api.
