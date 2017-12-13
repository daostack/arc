const helpers = require('./helpers');
const Controller = artifacts.require("./Controller.sol");
const Reputation = artifacts.require("./Reputation.sol");
const Avatar = artifacts.require("./Avatar.sol");
const DAOToken   = artifacts.require("./DAOToken.sol");
const TokenCapGC = artifacts.require('./globalConstraints/TokenCapGC.sol');
//todo : find out how to import this directly from zeppline.
const GlobalConstraintMock = artifacts.require('./test/GlobalConstraintMock.sol');



let reputation, avatar, accounts,controller,token;
var amountToMint = 10;

contract('TokenCapGC', function (accounts)  {
    it("setParameters", async () => {
      var tokenCapGC = await TokenCapGC.new();
      token  = await DAOToken.new("TEST","TST");
      var paramsHash = await tokencapgc.getParametersHash(token,100);
    });
  });
