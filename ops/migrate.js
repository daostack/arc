const fs = require('fs');
const Web3 = require('web3');
const HDWallet = require('hdwallet-accounts');

const UController = require('@daostack/arc/build/contracts/UController.json');
const GenesisProtocol = require('@daostack/arc/build/contracts/GenesisProtocol.json');
const Reputation = require('@daostack/arc/build/contracts/Reputation.json');
const ContributionReward = require('@daostack/arc/build/contracts/ContributionReward.json');
const DAOToken = require('@daostack/arc/build/contracts/DAOToken.json');
const Avatar = require('@daostack/arc/build/contracts/Avatar.json');

const { ethereum, test_mnemonic } = process.env;

async function migrateContracts() {
	const web3 = new Web3(ethereum);
	const hdwallet = HDWallet(10, test_mnemonic);
	Array(10)
		.fill(10)
		.map((_, i) => i)
		.forEach(i => {
			const pk = hdwallet.accounts[i].privateKey;
			const account = web3.eth.accounts.privateKeyToAccount(pk);
			web3.eth.accounts.wallet.add(account);
		});
	web3.eth.defaultAccount = web3.eth.accounts.wallet[0].address;

	const opts = {
		from: web3.eth.defaultAccount,
		gas: (await web3.eth.getBlock('latest')).gasLimit - 100000,
	};

	const UC = new web3.eth.Contract(UController.abi, undefined, opts);
	const uc = await UC.deploy({
		data: UController.bytecode,
		arguments: [],
	}).send();

	const Token = new web3.eth.Contract(DAOToken.abi, undefined, opts);
	const token = await Token.deploy({
		data: DAOToken.bytecode,
		arguments: ['TEST', 'TST', 1000000000],
	}).send();

	const gpToken = await Token.deploy({
		data: DAOToken.bytecode,
		arguments: ['TEST', 'TST', 1000000000],
	}).send();

	const GP = new web3.eth.Contract(GenesisProtocol.abi, undefined, opts);
	const gp = await GP.deploy({
		data: GenesisProtocol.bytecode,
		arguments: [gpToken.options.address],
	}).send();

	const Rep = new web3.eth.Contract(Reputation.abi, undefined, opts);
	const rep = await Rep.deploy({
		data: Reputation.bytecode,
		arguments: [],
	}).send();

	const CR = new web3.eth.Contract(ContributionReward.abi, undefined, opts);
	const cr = await CR.deploy({
		data: ContributionReward.bytecode,
		arguments: [],
	}).send();

	const AvatarContract = new web3.eth.Contract(Avatar.abi, undefined, opts);
	const avatar = await AvatarContract.deploy({
		data: Avatar.bytecode,
		arguments: ['TESTDAO', token.options.address, rep.options.address],
	}).send();

	const addresses = {
		UController: uc.options.address,
		NativeReputation: rep.options.address,
		NativeToken: token.options.address,
		DAOToken: gpToken.options.address,
		ContributionReward: cr.options.address,
		GenesisProtocol: gp.options.address,
		Avatar: avatar.options.address,
	};

	fs.writeFileSync('./migration.json', JSON.stringify(addresses, undefined, 2), 'utf-8');

	return addresses;
}

if (require.main == module) {
	migrateContracts();
} else {
	module.exports = migrateContracts;
}
