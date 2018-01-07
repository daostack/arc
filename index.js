export function requireContract(contractName) {
  return require(__dirname + `/build/contracts/${contractName}.json`)
}