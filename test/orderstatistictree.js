const TestOrderStatisticTree = artifacts.require("./TestOrderStatisticTree.sol");



contract('OrderStatisticTree', function (accounts) {

  it("insert, rank and count ", async function () {
    var values = [3,5,5,6,1,100,50];
    var ranks  = [1,2,2,4,0,6,5];
    var orderStatisticTree = await TestOrderStatisticTree.new();
    for (var i = 0;i<values.length;i++) {
      await orderStatisticTree.insert(values[i]);
    }
    var count = await orderStatisticTree.count();

    var rank;
    assert.equal(count,values.length);
    for (i = 0 ;i< count ;i++) {
      rank = await orderStatisticTree.rank(values[i]);
      assert.equal(ranks[i],rank);
    }

    var valuesInBetween = [4,8,20,101,2];
    var ranksInBetween  = [2,5,5,7,1];

    for (i = 0 ;i< valuesInBetween.length ;i++) {
      rank = await orderStatisticTree.rank(valuesInBetween[i]);
      assert.equal(ranksInBetween[i],rank);
    }

  });

});
