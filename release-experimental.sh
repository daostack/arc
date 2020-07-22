#!/bin/bash

rm -rf ./node_modules
rm -rf ./build
git checkout origin/master-2
echo "npm install ..."
npm i
echo "truffle compile ..."
npm buidler clean
npx buidler compile
# publish npm
echo "Publishing to npm..."
npm publish
# tag on github
git tag experimental-$(cat package.json | jq -r '.version')
git push --tags
# done
echo "Release done!"
