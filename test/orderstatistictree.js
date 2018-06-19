const OrderStatisticTreeMock = artifacts.require("./OrderStatisticTreeMock.sol");

const getRandomInt = async function (max) {
  return Math.floor(Math.random() * Math.floor(max));
};


contract('OrderStatisticTree', function () {

  it("insert, rank and count ", async function () {
    var values = [3,5,5,6,1,100,50];
    var ranks  = [1,2,2,4,0,6,5];
    var orderStatisticTree = await OrderStatisticTreeMock.new();
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

  it("gas usage ", async function () {

    var orderStatisticTree = await OrderStatisticTreeMock.new();
    var val,tx;
    var maxGasUsed = 0;
    for (var i = 0;i<100;i++) {
      val = await getRandomInt(500);
      tx = await orderStatisticTree.insert(val);
      if (tx.receipt.gasUsed > maxGasUsed) {
        maxGasUsed = tx.receipt.gasUsed;
      }
    }
    assert.isBelow(maxGasUsed,380000);
    maxGasUsed = 0;
    for (i = 0;i<100;i++) {
      val = await getRandomInt(500);
      var txhash = await orderStatisticTree.rank.sendTransaction(val);
      var receipt = await web3.eth.getTransactionReceipt(txhash);
      if (receipt.gasUsed > maxGasUsed) {
        maxGasUsed = receipt.gasUsed;
      }
    }
    assert.isBelow(maxGasUsed,35000);
  });

});
