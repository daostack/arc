#!/bin/sh

if [ ! -f .api_key ]; then
  echo "ERROR: .api_key file not found. Run 'npm run authorize' to obtain one"
  exit 1
else
  graph deploy "$@" --api-key $(cat .api_key) --ipfs /ip4/127.0.0.1/tcp/5001 --node http://127.0.0.1:8020/ -n daostack subgraph.yaml
fi
