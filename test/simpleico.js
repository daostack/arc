const helpers = require('./helpers');

var SimpleICO = artifacts.require("./SimpleICO.sol");


contract('SimpleICO', function(accounts) {

  before(function() {
    helpers.etherForEveryone();
  });

});
