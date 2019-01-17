//this migration file is used only for testing purpose
var constants = require('../test/constants');
var Avatar = artifacts.require('./Avatar.sol');
var UController = artifacts.require('./UController.sol');
var DaoCreator = artifacts.require('./DaoCreator.sol');
var ControllerCreator = artifacts.require('./ControllerCreator.sol');


var PriceOracleMock = artifacts.require('./PriceOracleMock.sol');
var ExternalTokenLockerMock = artifacts.require('./ExternalTokenLockerMock.sol');


var Auction4Reputation = artifacts.require('./Auction4Reputation.sol');
var ExternalLocking4Reputation = artifacts.require('./ExternalLocking4Reputation.sol');
var LockingEth4Reputation = artifacts.require('./LockingEth4Reputation.sol');
var LockingToken4Reputation = artifacts.require('./LockingToken4Reputation.sol');

const NULL_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';


// TEST_ORGANIZATION ORG parameters:
const orgName = "dxDAO";
const tokenName = "TestToken";
const tokenSymbol = "TST";
const founders = [];
const initRep = web3.utils.toWei("10");
const initRepInWei = [initRep];
const initToken = web3.utils.toWei("1000");
const initTokenInWei = [initToken];
const cap = web3.utils.toWei("100000000","ether");


/**********************
  !!!! Start and end dates should be such that they can be divided evenly by (NUM_AUCTIONS / 1000)
  **********************/
 const lockingPeriodStartDate      = 1547557200;//new Date("2019-01-15T15:00:00.000+0200");
 const lockingPeriodEndDate        = 1547564400;//new Date("2019-01-15T17:00:00.000+0200");
 const lockingPeriodStartDate_mgn  = 1547562600;
 const lockingPeriodEndDate_mgn    = 1547564400;
 /**********************
  !!!! Should be a number of auctions such that the sum of auction rep comes out to exactly TOTAL_REP_REWARD * AUCTION_BIDDING_RATIO
  **********************/
 const NUM_AUCTIONS = 5;
 const MAX_LOCK_PERIOD = 7200; // 2 hours in seconds, use 31536000 for one year
 /**********************
  !!!! Should be an amount that yields a whole number when multiplied by any of the ratios below
  **********************/
 const TOTAL_REP_REWARD = 1000000000;
 const AUCTION_BIDDING_RATIO = .1;    // 100000000 ( should be divided evenly by NUM_AUCTIONS )
 const TOKEN_LOCKING_RATIO = .3;      // 300000000
 const ETH_LOCKING_RATIO = .08;       //  80000000
 const EXTERNAL_LOCKING_RATIO = .5;   // 500000000
         /* potentially other: */     //  20000000

 const AUCTION_PERIOD = 1440;
 const REDEEM_ENABLE_DATE = lockingPeriodEndDate;

 const GEN_TOKEN_ADDRESS = "0x543Ff227F64Aa17eA132Bf9886cAb5DB55DCAddf";

// DAOstack parameters for universal schemes:


var accounts;

//Deploy test organization with the following schemes:
//schemeRegistrar, upgradeScheme,globalConstraintRegistrar,simpleICO,contributionReward.
module.exports = async function(deployer) {
    deployer.deploy(ControllerCreator, {gas: constants.ARC_GAS_LIMIT}).then(async function(){
      var controllerCreator = await ControllerCreator.deployed();
      await deployer.deploy(DaoCreator,controllerCreator.address);
      var daoCreatorInst = await DaoCreator.deployed(controllerCreator.address,{gas: constants.ARC_GAS_LIMIT});
      // Create DAOstack:

      await web3.eth.getAccounts(function(err,res) { accounts = res; });
      founders[0] = accounts[0];
      var returnedParams = await daoCreatorInst.forgeOrg(orgName, tokenName, tokenSymbol, founders,
          [0], [0],NULL_ADDRESS,cap,{gas: constants.ARC_GAS_LIMIT});
      var AvatarInst = await Avatar.at(returnedParams.logs[0].args._avatar);


      await deployer.deploy(Auction4Reputation);
      var auction4Reputation = await Auction4Reputation.deployed();

      await auction4Reputation.initialize(
        AvatarInst.address,
        web3.utils.toWei("100000000"),
        lockingPeriodStartDate,
        AUCTION_PERIOD,
        NUM_AUCTIONS,
        REDEEM_ENABLE_DATE,
        GEN_TOKEN_ADDRESS,
        AvatarInst.address
      );

      await deployer.deploy(ExternalTokenLockerMock);
      var externalTokenLockerMock = await ExternalTokenLockerMock.deployed();

      await deployer.deploy(ExternalLocking4Reputation);
      var externalLocking4Reputation = await ExternalLocking4Reputation.deployed();

      await externalLocking4Reputation.initialize(
        AvatarInst.address,
        web3.utils.toWei("50000000"),
        lockingPeriodStartDate_mgn,
        lockingPeriodEndDate_mgn,
        REDEEM_ENABLE_DATE,
        externalTokenLockerMock.address,
        "lockedTokenBalances(address)"
      );


      await deployer.deploy(LockingEth4Reputation);
      var lockingEth4Reputation = await LockingEth4Reputation.deployed();

      await lockingEth4Reputation.initialize(
        AvatarInst.address,
        web3.utils.toWei("8000000"),
        lockingPeriodStartDate,
        lockingPeriodEndDate,
        REDEEM_ENABLE_DATE,
        MAX_LOCK_PERIOD
      );

      await deployer.deploy(LockingToken4Reputation);
      var lockingToken4Reputation = await LockingToken4Reputation.deployed();

      await deployer.deploy(PriceOracleMock);
      var priceOracleMock = await PriceOracleMock.deployed();
      var gnoTokenAddress = "0x6018bf616ec9db02f90c8c8529ddadc10a5c29dc";
      await priceOracleMock.setTokenPrice(gnoTokenAddress, 380407, 200000000);

      await lockingToken4Reputation.initialize(
        AvatarInst.address,
        web3.utils.toWei("30000000"),
        lockingPeriodStartDate,
        lockingPeriodEndDate,
        REDEEM_ENABLE_DATE,
        MAX_LOCK_PERIOD,
        priceOracleMock.address
      );

      var schemesArray = [externalLocking4Reputation.address,
                          auction4Reputation.address,
                          lockingEth4Reputation.address,
                          lockingToken4Reputation.address];
      const paramsArray = [NULL_HASH,
                           NULL_HASH,
                           NULL_HASH,
                           NULL_HASH];
      const permissionArray = ['0x00000001', '0x00000001', '0x00000001','0x00000001'];

      // set DAOstack initial schmes:
      await daoCreatorInst.setSchemes(
        AvatarInst.address,
        schemesArray,
        paramsArray,
        permissionArray);
  });
};
