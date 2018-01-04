var shell = require('shelljs');
var path = require('path');
const format = require('string-format');
var fs = require('fs');
const Twig = require('twig');
const solparse = require('solparse');

/* 
This is a simple build file that automatically generates 
`.md` documentation from `.sol` files under `contracts/`.

It uses [twigjs](https://github.com/twigjs/twig.js/wiki) as a templating engine (template can be found at `docs/gen/contract.md.twig`).
And [solidity-structure](https://www.npmjs.com/package/solidity-structure) to get parsed info out of `.sol` files.

- The script generates all docs under `docs/ref/`.
*/

function transform(parsed){
    function transformContract(contract){
        function transformParam(param){
            return {
                name: param.id,
                type: param.literal.literal
            };
        }
        
        function transformFunction(fn){
            return {
                name: fn.name,
                params: fn.params ? fn.params.map(transformParam) : [],
                returns: fn.returnParams && fn.returnParams.params ? fn.returnParams.params.map(transformParam) : [],
                constant: fn.modifiers.filter(m => m.name === 'constant').length > 0,
                public: fn.modifiers.filter(m => m.name === 'public').length > 0,
            };
        }
        
        function transformStruct(struct){
            return {
                name: struct.name,
            };
        }
        
        function transformEvent(event){
            return {
                name: event.name,
                params: event.params ? event.params.map(transformParam) : []
            };
        }
        
        function transformVariable(variable){
            return {
                name: variable.name,
            };
        }

        const fns = contract.body.filter(x => x.type === 'FunctionDeclaration').map(transformFunction).filter(fn=>fn.public);
        const constructors = fns.filter(fn => fn.name === contract.name);

        return {
            name: contract.name,
            parents: contract.is.map(p => p.name),
            structs: contract.body.filter(x => x.type === 'StructDeclaration').map(transformStruct),
            events: contract.body.filter(x => x.type === 'EventDeclaration').map(transformEvent),
            variables: contract.body.filter(x => x.type === 'StateVariableDeclaration').map(transformVariable),
            functions: fns.filter(fn => fn.name !== contract.name),
            constructor: constructors.length ? constructors[0] : null
        };
    }

    const contracts = parsed.body.filter(s => s.type === 'ContractStatement').map(transformContract);
    return {contracts};
}

function generate(source,cb){
    try{
        const parsed = solparse.parseFile(source);
        const data = transform(parsed);
        fs.writeFileSync('./docs/gen/transformed-example.json', JSON.stringify(data,undefined,2));
        Twig.renderFile('./docs/gen/contract.md.twig', data, (err,output)=>cb(source, err, output));
    }
    catch(e){
        cb(source,e,null);
    }
}

shell.mkdir('-p','./docs/ref');
const files = shell.ls('./contracts/*/*.sol');

Twig.renderFile('./docs/gen/reference.md.twig', {contracts: files.map(f => path.basename(f).replace('.sol',''))}, (err,output)=>{
    shell.echo('Generating reference doc ...');
    if(err){
        shell.echo(format('Could not generate reference doc: {0}',file,err));
        shell.rm('-rf','./docs/ref');
        shell.exit(1);
    }
    else{
        const newname = './docs/reference.md';
        fs.writeFileSync(newname, output);
    }
});

const cb = 
    (file, err,output)=>{
        shell.echo(format('Generating doc for file `{0}` ...', file));
        if(err){
            shell.echo(format('Could not generate doc for `{0}`: {1}',file,err));
            shell.rm('-rf','./docs/ref');
            shell.exit(1);
        }
        else{
            
            const newname = './docs/ref/'+path.basename(file).replace('.sol','.md');
            fs.writeFileSync(newname, output);
            if(files.length)
                generate(files.pop(),cb);
        }
    };

generate(files.pop(),cb);