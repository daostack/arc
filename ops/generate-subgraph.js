const fs = require('fs');
const path = require('path');
const glob = require('glob');
const yaml = require('js-yaml');

/**
 * Generate a `subgraph.yaml` file from `datasource.yaml` fragments in `mappings` directory and `migration.json`
 */
async function generateSubgraph() {
	const addresses = JSON.parse(fs.readFileSync('./migration.json', 'utf-8'));

	const files = await new Promise((res, rej) =>
		glob('src/mappings/**/datasource.yaml', (err, files) => (err ? rej(err) : res(files)))
	);

	const dataSources = files.map(file => {
		const contract = path.basename(path.dirname(file));
		const { abis, entities, eventHandlers } = yaml.safeLoad(fs.readFileSync(file, 'utf-8'));
		return {
			kind: 'ethereum/contract',
			name: `${contract}`,
			source: {
				address: addresses[contract] || '<ADDRESS NOT FOUND IN migration.json>',
				abi: abis && abis.length ? abis[0] : contract,
			},
			mapping: {
				kind: 'ethereum/events',
				apiVersion: '0.0.1',
				language: 'wasm/assemblyscript',
				file: path.join(path.dirname(file), 'mapping.ts'),
				entities,
				abis: (abis || [contract]).map(contract => ({ name: contract, file: `./abis/${contract}.json` })),
				eventHandlers,
			},
		};
	});

	const subgraph = {
		specVersion: '0.0.1',
		schema: { file: './schema.graphql' },
		dataSources,
	};

	fs.writeFileSync('subgraph.yaml', yaml.safeDump(subgraph, { noRefs: true }), 'utf-8');
}

if (require.main == module) {
	generateSubgraph();
} else {
	module.exports = generateSubgraph;
}
