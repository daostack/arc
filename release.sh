#!/bin/bash

rm -rf ./node_modules
rm -rf ./build
git checkout origin/master
echo "npm install ..."
npm i
echo "truffle compile ..."
npm hardhat clean
npx hardhat compile
# publish npm
echo "Publishing to npm..."
npm publish
# tag on github
git tag $(cat package.json | jq -r '.version')
git push --tags
# done
echo "Release done!"
