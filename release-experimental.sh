#!/bin/bash

rm -rf ./node_modules
rm -rf ./build
git checkout origin/arc-factory
echo "npm install ..."
npm i
echo "truffle compile ..."
truffle compile
# publish npm
echo "Publishing to npm..."
npm publish
# tag on github
git tag experimental-$(cat package.json | jq -r '.version')
git push --tags
# done
echo "Release done!"
