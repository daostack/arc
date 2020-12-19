const fs = require('fs');
const path = require('path');

/**
 * Extract abis from Arc contracts folder into truffle compatible format
 */
async function extractAbis (base) {
  var files = fs.readdirSync(base);
  for (var i = 0; i < files.length; i++) {
    var filename = path.join(base, files[i]);
    var stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      extractAbis(filename); // recurse
    } else if (filename.indexOf('.json') >= 0 && filename.indexOf('.dbg') === -1) {
      console.log('-- found: ', filename);
      const contract = JSON.parse(fs.readFileSync(filename, 'utf-8'));
      fs.writeFileSync(
        path.join('./build/contracts', files[i]),
        JSON.stringify(contract, undefined, 2),
        'utf-8'
      );
    }
  }
}

if (require.main === module) {
    extractAbis('./build/contracts/contracts').catch(err => {
      console.log(err);
      process.exit(1);
    });
} else {
  module.exports = {
    extractAbis
  };
}
