const StandardTokenMock = artifacts.require('./test/StandardTokenMock.sol');
const GenesisScheme = artifacts.require("./GenesisScheme.sol");
const UniversalSchemeMock = artifacts.require('./test/UniversalSchemeMock.sol');
const UController = artifacts.require('./test/UController.sol');
 /*eslint-disable no-alert, no-console */

export class VoteInOrganizationParams {
  constructor() {
  }
}

const setup = async function (accounts,genesisScheme,controller = 0) {
//  genesisScheme = await GenesisScheme.deployed();
  var tx = await genesisScheme.forgeOrg("testOrg","TEST","TST",[accounts[0]],[1],[1],controller);
  assert.equal(tx.logs.length, 1);
  assert.equal(tx.logs[0].event, "NewOrg");
  return  tx.logs[0].args._avatar;
};

contract('measuremtns', function(accounts) {
    it("genesisScheme forgeOrg  ", async function() {
       var genesisScheme = await GenesisScheme.deployed();
       var tx;
       var i,j;
       var GasUsage = [];

       for  (i=0;i< accounts.length;i++){
        var founders= [];
        var foundersTokensAndReputation= [];
        for (j=0;j<i;j++){
          founders[j] =accounts[j];
          foundersTokensAndReputation[j] = j;
        }
       tx = await genesisScheme.forgeOrg("testOrg","TEST","TST",founders,foundersTokensAndReputation,foundersTokensAndReputation,0,{from:accounts[1]},{gas: 5500000});
       GasUsage[i]= tx.receipt.gasUsed;
      }

       console.log("forgeOrg GasUsage");
       console.log("founders|gas");
       console.log("-------------------");
       for  (i=0;i< accounts.length;i++){
       console.log(i +"       |"+ GasUsage[i]);
       }
    });

    it("genesisScheme setSchemes  ", async function() {
       //console.log("txCount:" + web3.eth.getTransactionCount(accounts[0]));
       var genesisScheme = await GenesisScheme.deployed();
       //console.log("txCount after deployment:" + web3.eth.getTransactionCount(accounts[1]));
       var tx;
       var i,j;
       var GasUsageForSetScheme = [];
       var GasUsageForSchemeSetParams;

       for  (i=0;i< 10;i++){
         var schemes= [];
         var permissions = [];
         var params     = [];
         var avatarAddress = await setup(accounts,genesisScheme);

         var universalSchemeMock = await UniversalSchemeMock.new();
         tx = await universalSchemeMock.setParameters(1,2,3,4,5,6,7,8);
         GasUsageForSchemeSetParams = tx.receipt.gasUsed;

         var paramHash = await universalSchemeMock.getParametersHash(1,2,3,4,5,6,7,8);

         for (j=0;j<i;j++){
           schemes[j] =universalSchemeMock.address;
           permissions[j] = "0x0000000F";
           params[j] = paramHash;
         }
       tx = await genesisScheme.setSchemes(avatarAddress,schemes,params,permissions);
       GasUsageForSetScheme[i]= tx.receipt.gasUsed;
      }
       console.log("setSchemes GasUsage table");
       console.log("schemes|setScheme|setParameters");
       console.log("------------------------------------------------------");
       for  (i=0;i< accounts.length;i++){
         if (i== 0) {
           console.log(i +"      |"+ GasUsageForSetScheme[i]+"    |"+GasUsageForSchemeSetParams*i);

         }else{
           if((GasUsageForSetScheme[i])<100000){
             console.log(i +"      |"+ GasUsageForSetScheme[i]+"    |"+GasUsageForSchemeSetParams*i);

           }else{
       console.log(i +"      |"+ GasUsageForSetScheme[i]+"   |"+GasUsageForSchemeSetParams*i);
     }
     }
       }
    });

    it("genesisScheme forgeOrg universal controller ", async function() {
       var genesisScheme = await GenesisScheme.deployed();
       var tx;
       var i,j;
       var GasUsage = [];
       var uController;
       for  (i=0;i< accounts.length;i++){
        var founders= [];
        var foundersTokensAndReputation= [];
        for (j=0;j<i;j++){
          founders[j] =accounts[j];
          foundersTokensAndReputation[j] = j;
        }
        uController = await UController.new();
       tx = await genesisScheme.forgeOrg("testOrg","TEST","TST",founders,foundersTokensAndReputation,foundersTokensAndReputation,uController.address,{from:accounts[1]},{gas: 5500000});
       GasUsage[i]= tx.receipt.gasUsed;
      }

       console.log("forgeOrg GasUsage");
       console.log("founders|gas");
       console.log("-------------------");
       for  (i=0;i< accounts.length;i++){
       console.log(i +"       |"+ GasUsage[i]);
       }
    });

    it("genesisScheme setSchemes universal controller ", async function() {
       //console.log("txCount:" + web3.eth.getTransactionCount(accounts[0]));
       var genesisScheme = await GenesisScheme.deployed();
       //console.log("txCount after deployment:" + web3.eth.getTransactionCount(accounts[1]));
       var tx;
       var i,j;
       var GasUsageForSetScheme = [];
       var GasUsageForSchemeSetParams;
       var uController;

       for  (i=0;i< 10;i++){
         var schemes= [];
         var permissions = [];
         var params     = [];
         uController = await UController.new();
         var avatarAddress = await setup(accounts,genesisScheme,uController.address);

         var universalSchemeMock = await UniversalSchemeMock.new();
         tx = await universalSchemeMock.setParameters(1,2,3,4,5,6,7,8);
         GasUsageForSchemeSetParams = tx.receipt.gasUsed;

         var paramHash = await universalSchemeMock.getParametersHash(1,2,3,4,5,6,7,8);

         for (j=0;j<i;j++){
           schemes[j] =universalSchemeMock.address;
           permissions[j] = "0x0000000F";
           params[j] = paramHash;
         }
       tx = await genesisScheme.setSchemes(avatarAddress,schemes,params,permissions);
       GasUsageForSetScheme[i]= tx.receipt.gasUsed;
      }
       console.log("setSchemes GasUsage table");
       console.log("schemes|setScheme|setParameters");
       console.log("------------------------------------------------------");
       for  (i=0;i< accounts.length;i++){
         if (i== 0) {
           console.log(i +"      |"+ GasUsageForSetScheme[i]+"    |"+GasUsageForSchemeSetParams*i);

         }else{
           if((GasUsageForSetScheme[i])<100000){
             console.log(i +"      |"+ GasUsageForSetScheme[i]+"    |"+GasUsageForSchemeSetParams*i);

           }else{
       console.log(i +"      |"+ GasUsageForSetScheme[i]+"   |"+GasUsageForSchemeSetParams*i);
     }
     }
       }
    });
});
