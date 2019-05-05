const math = require("math");
var SQRTCurve = artifacts.require("./SQRTCurve.sol");
const BigNumber = require('bignumber.js');

contract('SQRTCurve', function(){

    it("test 1", async () => {
      let curve = await SQRTCurve.new();
      for (let i = 0;i<1000;i = i+ 50) {
        assert.equal(await curve.calc(i),math.floor(math.sqrt(i)));
      }
      let bigNum = ((new BigNumber(2)).toPower(254));
      assert.equal(await curve.calc(bigNum.toString(10)),math.floor(math.sqrt(bigNum)));
    });
});
