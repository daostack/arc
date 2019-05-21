const math = require("math");
var PolkaCurve = artifacts.require("./PolkaCurve.sol");

contract('PolkaCurve', function(){

    it("test 1", async () => {
      let curve = await PolkaCurve.new();
      var total_reputation = await curve.TOTAL_REPUTATION();
      assert.equal(total_reputation,800000);
      var sum_of_sqrt = await curve.SUM_OF_SQRTS();
      assert.equal(sum_of_sqrt,1718050);
      var expected;
      for (let i = 0;i<1000;i = i+ 50) {
        expected = Math.floor((( math.sqrt(i) * total_reputation)/sum_of_sqrt) * 1000000000) * 1000000000;
        assert.equal(Math.floor((await curve.calc(i))/10000000000), Math.floor(expected/10000000000));
      }
      let bigNum = 1000000000;
      expected = Math.floor((( math.sqrt(bigNum) * total_reputation)/sum_of_sqrt) * 1000000000) * 1000000000;
      assert.equal(Math.floor((await curve.calc(bigNum.toString(10)))/10000000000),Math.floor(expected/10000000000));
    });
});
