const solc = require('solc')
const fs = require('fs')
const path = require('path')
const shell = require('shelljs')
const format = require('string-format')

function render(contractName,abi,devdoc,userdoc){
    return contractName
}

const files = ['./contracts/VotingMachines/AbsoluteVote.sol']
const input = {
    sources: files.reduce((acc,file)=>({...acc,[file]: fs.readFileSync(file,'utf-8')}),{})
}

shell.echo('Compiling contracts...')
const output = solc.compile(input,1,file => {
    const node_path = path.resolve('node_modules',file);
    return {contents: fs.readFileSync(fs.existsSync(node_path) ? node_path : file,'utf-8')}
});

for(let contract in output.contracts){
    const split = contract.split(':');
    const file = split[0];
    const contractName = split[1];
    const destination = file.replace('contracts','docs/ref').replace('.sol','.md')
    if(files.indexOf(file) === -1)
        continue;

    const data = output.contracts[contract];
    const metadata = JSON.parse(data.metadata).output;

    shell.echo('Rendering '+ file +' to '+ destination +'...')
    shell.mkdir('-p',path.dirname(destination))
    fs.writeFileSync(
        destination,
        render(contractName,metadata.abi,metadata.devdoc,metadata.userdoc)
    )
}

