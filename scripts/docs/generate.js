/**
 * This module exports functions for rendering `.md` files from `.sol` files.
 * as markdown files for use in the documentation.
 * it uses
 *   - `solcjs` to compile the files and get the metadata.
 *
 * author: Matan Tsuberi (dev.matan.tsuberi@gmail.com)
 */

const solc = require('solc');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

/**
 * @function - compile all files in `inputDir`.
 * @param args - files to compile
 * @return - a list of the form [{file, contractName, data: compilerOutput}].
 */
const compile = (files) => {
    // organize compiler input
    const input = {sources: files.reduce((acc,file)=>({...acc,[file]: fs.readFileSync(file,'utf-8')}),{})};
    const output = solc.compile(input,1,file => {
        /* we need to resolve imports for the compiler.
         * This is not ideal, but does have some benefits:
         *  - gives all information about the files (including natspec).
         *  - always up to date and according to spec.
         *  - compatible with everything.
         */
        const node_path = path.resolve('node_modules',file);
        return {contents: fs.readFileSync(fs.existsSync(node_path) ? node_path : file, 'utf-8')};
    });

    return Object.keys(output.contracts).map(contract =>{
        // The compiler returns output in the form of {'somefile.sol:somecontract': ...}
        const split = contract.split(':');
        const file = split[0];
        const contractName = split[1];
        return {file, contractName, data: output.contracts[contract]};
    }).filter(({file}) => files.indexOf(file) !== -1);
};

/**
 * @function - renders files as `.md` files according to templates and given info.
 *             includes headers in the templates according to `headerFn`.
 *             outputs rendered files into `dest`.
 * @param compileOutput - a list of the form [{file,contractName, data: compilerOutput}].
 * @param destFn - a pure function receiving either 'toc'(for table of contents) or a `file` path and `contractName` that returns a new path for the rendered `.md` file.
 * @param contractTemplate - a function receiving `dest`,`contractName`,`abi`,`devdoc`,`gasEstimates` and outputs an `.md` string.
 */
const render = (compileOutput,destFn,contractTemplate) => {
    compileOutput.forEach(({file,contractName,data}) => {
        const abi = JSON.parse(data.interface);
        const metadata = data.metadata !== '' ? JSON.parse(data.metadata).output : {};
        const devdoc = metadata.devdoc || {};
        const destination = destFn(file,contractName);
        const renderedContract = contractTemplate(file,contractName,abi,devdoc,data.gasEstimates);
        shell.mkdir('-p',path.dirname(destination));
        fs.writeFileSync(
            destination,
            renderedContract
        );
    });
};

module.exports = {compile,render};
