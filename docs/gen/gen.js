/*
 * This is a simple build script which renders all `.sol` files under `contracts/`
 * as markdown files for use in the documentation.
 * it uses 
 *   - `solcjs` to compile the files and get the metadata.
 *   - `shelljs` to do some general file system commands.
 * 
 * all generated files are in `docs/ref/**.md`
 * 
 * author: Matan Tsuberi (dev.matan.tsuberi@gmail.com)
 */

const solc = require('solc');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

function main(){
    // returns an `.md` string based on given data.
    function render(file,contractName,abi,devdoc,gas){
        /* This is a little trick to make templates more readable. used like `line1${N}line2`*/
        const N = '\n';

        const events = abi.filter(x => x.type === 'event').sort((x,y) => x.name <= y.name);
        const functions = abi.filter(x => x.type === 'function').sort((x,y) => x.name <= y.name);
        const constructors = abi.filter(x => x.type === 'constructor').sort((x,y) => x.name <= y.name);
        const fallbacks = abi.filter(x => x.type === 'fallback').sort((x,y) => x.name <= y.name);
        const fallback = fallbacks.length ? fallbacks[0] : null;
        const methods = devdoc.methods || {};

        // This turns header text into a hyphenated version that we can put in a hash link
        const hyphenate = (s) => 
            s.toLowerCase()
            .replace(new RegExp('[.,\\/#!$%\\^&\\*;:{}=\\-_`~()]+','g'),'')
            .trim()
            .replace(new RegExp('[ ]+','g'),'-');

        const gasEstimate = (est) => est || 'Infinite';
        const signature = (name,ps) => `${name}(${ps.map(p => `${p.type}`).join(', ')})`;
        const headerLink = (title,link) => `    - [${title}](#${hyphenate(link)})`;
        const title = (prefix,text) => `### *${prefix}* ${text}`;
        const functionComment = (obj) => obj.details ? obj.details : '';
        const paramComment = (obj, name) => obj.params && obj.params[name] ? `- ${obj.params[name]}` : '';

        const modifiers = (fn) => 
            `**${
                [...fn.payable ? ['payable'] : [],
                ...fn.constant ? ['constant'] : [],
                ...fn.stateMutability && !fn.payable ? [fn.stateMutability] : []]
                .join(' | ')}**`;

        const param = (obj,p,i) => `    ${i+1}. **${p.name || 'unnamed'}** *of type ${p.type}${paramComment(obj,p.name)}*`;
        const params = (obj,title,ps) =>
            `*${title}:*${N
            }${ps.length ? ps.map((p,i) => param(obj,p,i)).join(N) : '*Nothing*'}${N
            }`;

        const constructor = (fn) =>{
            const sign = signature(contractName,fn.inputs);
            const obj = methods[sign] || {};
            return (
            `${title('constructor',sign)}${N
            }*Execution cost upper limit: **${gasEstimate(gas.external[sign])} gas***${N
            }${modifiers(fn)}${N
            }${functionComment(obj)}${N
            }${params(obj,'Params',fn.inputs)}${N
            }`);
        };

        const event = (e) =>
            `${title('event',e.name)}${N
            }${params({},'Params',e.inputs)}${N
            }`;

        const func = (fn) =>{
            const sign = signature(fn.name,fn.inputs);
            const obj = methods[sign] || {};
            return (
            `${title('function',fn.name)}${N
            }*Execution cost upper limit: **${gasEstimate(gas.external[sign])} gas***${N
            }${modifiers(fn)}${N
            }${functionComment(obj)}${N
            }${params(obj,'Inputs',fn.inputs)}${N
            }${obj.return ? obj.return : params({},'Returns',fn.outputs)}${N
            }`);
        };

        const fb = (fn) =>{
            const obj = methods[''] || {};
            return (
            `*Execution cost upper limit: **${gasEstimate(gas.external[''])} gas***${N
            }${modifiers(fn)}${N
            }${functionComment(obj)}${N
            }`);
        };

        const description = devdoc.title ? `\n${devdoc.title}` : '';

        const res = (
            `# *contract* ${contractName} ([source](https://github.com/daostack/daostack/tree/master/${file}))${N
            }*Code deposit upper limit: **${gasEstimate(gas.creation[1])} gas***${N
            }*Executionas upper limit: **${gasEstimate(gas.creation[0])} gas***${N
            }${description}${N
            }- [Constructors](#constructors)${N
            }${constructors.map(c => headerLink(signature(contractName,c.inputs),title('constructor',signature(contractName,c.inputs)))).join(N)}${N
            }- [Events](#events)${N
            }${events.map(e => headerLink(e.name,title('event',e.name))).join(N)}${N
            }- [Fallback](#fallback)${N
            }- [Functions](#functions)${N
            }${functions.map(f => headerLink(f.name,title('function',f.name))).join(N)}${N
            }## Constructors${N
            }${constructors.map(c => constructor(c)).join(N)}${N
            }## Events${N
            }${events.map(e => event(e)).join(N)}${N
            }## Fallback${N
            }${fallback ? fb(fallback) : '*Nothing*'}${N
            }## Functions${N
            }${functions.map(f => func(f)).join(N)}${N
            }`);
        return res;
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
        // The compiler returns output in the form of {'somefile.sol:somecontract': ...} 
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
            render(file,contractName,abi,devdoc,data.gasEstimates)
        );
    }
}

try{
    main();
    shell.echo('Done.');
    shell.exit(0);
}
catch(e){
    shell.echo(`An error occurred`);
    shell.echo(e.stack);
    shell.exit(1);
}
