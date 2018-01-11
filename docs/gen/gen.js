const solc = require('solc');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

/*
 * This is a simple build script which renders all `.sol` files under `contracts/`
 * as markdown files for use in the documentation.
 * it uses 
 *   - `solcjs` to compile the files and get the metadata.
 *   - `shelljs` to do some general file system commands.
 * 
 * author: Matan Tsuberi (dev.matan.tsuberi@gmail.com)
 */
function main(){
    function signature(f){
        return `${f.name}(${f.inputs.map(i => i.type).join(',')})`;
    }
    
    // returns an `.md` string based on given data.
    function render(file,contractName,abi,devdoc){
        const events = abi.filter(x => x.type === 'event').sort((x,y) => x.name <= y.name);
        const functions = abi.filter(x => x.type === 'function').sort((x,y) => x.name <= y.name);
        const methods = devdoc.methods || {};
        const title = devdoc.title || '';

        /* This is very ugly, but in order for the generated markdown to be clean,
           we cannot use any indentation which doesn't appear in the `.md` file */
        return (
`# *contract* ${contractName} ([source](${'https://github.com/daostack/daostack/tree/master/'+file}))
${title}

- [Events](#events)
${events.map(e => `    - [${e.name}](#event-${e.name.toLowerCase()})`).join('\n')}
- [Functions](#functions)
${functions.map(f => `    - [${f.name}](#function-${f.name.toLowerCase()})`).join('\n')}

## Events
${events.map(e => 
`### *event* ${e.name}
*Parameters:*
${e.inputs.length ? e.inputs.map((input,i) => 
`${i+1}. **${input.name || 'unnamed'}** *of type ${input.type}*`
).join('\n') : '*Nothing*'}
`)
.join('\n')}
## Functions
${functions.map(f => 
`### *function* ${f.name || '*default*'}
${f.constant? '**constant**\n' : ''}${f.constant? '**payable**\n' : ''}${f.stateMutability? `**${f.stateMutability}**\n` : ''}${methods[signature(f)] ? '\n' + methods[signature(f)].details : ''}
*Inputs:*
${f.inputs.length ? f.inputs.map((input,i) => 
`${i+1}. **${input.name || 'unnamed'}** *of type ${input.type}*${methods[signature(f)] && methods[signature(f)].params ? ' - ' + methods[signature(f)].params[input.name] : ''}`
).join('\n') : '*Nothing*'}

*Returns:*
${
    methods[signature(f)] ? 
        methods[signature(f)].return || '*Nothing*'
    : 
        f.outputs.length ? f.outputs.map((output,i) => 
            `${i+1}. **${output.type}**`
        ).join('\n') : '*Nothing*'
}
`)
.join('\n')}
`);
    }
    
    const files = shell.ls('./contracts/*/*.sol'); // TODO: arbitrary nesting

    // organize all inputs for the compiler.
    const input = {
        sources: files.reduce((acc,file)=>({...acc,[file]: fs.readFileSync(file,'utf-8')}),{})
    };
    
    shell.rm('-rf','./docs/ref');
    shell.echo('Compiling contracts ...');
    const output = solc.compile(input,1,file => {
        /* we need to resolve imports for the compiler. 
         * This is not ideal, but does have some benefits:
         *  - gives all information about the files (including natspec).
         *  - always up to date and according to spec.
         *  - compatible with everything.
         */
        const node_path = path.resolve('node_modules',file);
        return {contents: fs.readFileSync(fs.existsSync(node_path) ? node_path : file,'utf-8')};
    });
    
    for(let contract in output.contracts){
        // The compile returns output in the form of {'somefile.sol:somecontract': ...} 
        const split = contract.split(':');
        const file = split[0];
        const contractName = split[1];
        const destination = path.resolve(path.dirname(file.replace('contracts','docs/ref')),`${contractName}.md`);
        
        if(files.indexOf(file) === -1)
            continue;
    
        // Get some info
        const data = output.contracts[contract];
        const abi = JSON.parse(data.interface);
        const metadata = data.metadata !== '' ? JSON.parse(data.metadata).output : {};
        const devdoc = metadata.devdoc || {};
    
        shell.echo('Rendering '+ file +' to '+ destination + '...');
        shell.mkdir('-p',path.dirname(destination));
        fs.writeFileSync(
            destination,
            render(file,contractName,abi,devdoc)
        );
    }
}

try{
    main();
    shell.echo('Done.');
    shell.exit(0);
}
catch(e){
    shell.echo(`An error occured: ${e.message}`);
    shell.exit(1);
}
