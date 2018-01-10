const solc = require('solc');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

function main(){
    function signature(f){
        return `${f.name}(${f.inputs.map(i => i.type).join(',')})`;
    }
    
    function render(contractName,abi,devdoc){
        const events = abi.filter(x => x.type === 'event').sort((x,y) => x.name <= y.name);
        const functions = abi.filter(x => x.type === 'function').sort((x,y) => x.name <= y.name);
        const methods = devdoc.methods || {};
        const title = devdoc.title || {};
    
        return (
`# *contract* ${contractName}
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

${f.constant? '**constant**\n' : ''}${f.constant? '**payable**\n' : ''}${f.stateMutability? `**${f.stateMutability}**\n` : ''}

${methods[signature(f)] ? methods[signature(f)].details : ''}

*Inputs:*
${f.inputs.length ? f.inputs.map((input,i) => 
`${i+1}. **${input.name || 'unnamed'}** *of type ${input.type}* - ${methods[signature(f)] && methods[signature(f)].params ? methods[signature(f)].params[input.name] : ''}`
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
    
    // TODO: arbitrary nesting:
    const files = shell.ls('./contracts/*/*.sol');
    
    const input = {
        sources: files.reduce((acc,file)=>({...acc,[file]: fs.readFileSync(file,'utf-8')}),{})
    };
    
    shell.rm('-rf','./docs/ref');
    shell.echo('Compiling contracts ...');
    const output = solc.compile(input,1,file => {
        const node_path = path.resolve('node_modules',file);
        return {contents: fs.readFileSync(fs.existsSync(node_path) ? node_path : file,'utf-8')};
    });
    
    for(let contract in output.contracts){
        const split = contract.split(':');
        const file = split[0];
        const contractName = split[1];
        const destination = file.replace('contracts','docs/ref').replace('.sol','.md');
        
        if(files.indexOf(file) === -1)
            continue;
    
        const data = output.contracts[contract];
        const abi = JSON.parse(data.interface);
        const metadata = data.metadata !== '' ? JSON.parse(data.metadata).output : {};
        const devdoc = metadata.devdoc || {};
    
        shell.echo('Rendering '+ file +' to '+ destination + '...');
        shell.mkdir('-p',path.dirname(destination));
        fs.writeFileSync(
            destination,
            render(contractName,abi,devdoc)
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