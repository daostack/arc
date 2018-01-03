var shell = require('shelljs');
var sd = require('solidity-doc');
var path = require('path');

// This is a simple build script that turns the 
// .sol files in /contracts into .md files in /docs
shell.mkdir('./docs/ref');
shell.ls('./contracts/*/*.sol').forEach(function (file) {
    var newname = './docs/ref/' + path.basename(file).replace('.sol','.md');

    shell.echo('Generating `'+ file +'` to `' + newname);
    shell.exec('node node_modules/solidity-doc/bin/solidity-doc generate '+file+' > '+newname+'');
});