var shell = require('shelljs');
var path = require('path');
const format = require('string-format');
var fs = require('fs');
const SolidityStructure = require('solidity-structure');
const Twig = require('twig');

/* 
This is a simple build file that automatically generates 
`.md` documentation from `.sol` files under `contracts/`.

It uses [twigjs](https://github.com/twigjs/twig.js/wiki) as a templating engine (template can be found at `docs/template.md.twig`).
And [solidity-structure](https://www.npmjs.com/package/solidity-structure) to get parsed info out of `.sol` files.

- The script generates all docs under `docs/ref/`.
*/

function sortByKey(obj) {
    return Object.keys(obj).sort().reduce((sortedObj, key) => Object.assign(sortedObj, {[key]: obj[key]}), {});
}

function generate(source,cb){
    try{
        const structure = SolidityStructure.parseFile(source, {mergeWithParents: false}).toJSON();
        for (let part of ['functions', 'constantFunctions'])
            structure[part] = sortByKey(structure[part]);    
        Twig.renderFile('./docs/template.md.twig', structure, (err,output)=>cb(source, err, output));
    }
    catch(e){
        cb(source,e,null);
    }
}

shell.mkdir('-p','./docs/ref');
const files = shell.ls('./contracts/*/*.sol');

const cb = 
    (file, err,output)=>{
        if(err){
            shell.echo(format('Could not generate doc for `{0}`: {1}',file,err));
            shell.rm('-rf','./docs/ref');
            shell.exit(1);
        }
        else{
            shell.echo(format('Generating doc for file `{0}` ...', file));
            const newname = './docs/ref/'+path.basename(file).replace('.sol','.md');
            fs.writeFile(newname, output);
            if(files.length)
                generate(files.pop(),cb);
        }
    };

generate(files.pop(),cb);