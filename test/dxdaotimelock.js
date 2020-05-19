const helpers = require('./helpers');

const Wallet = artifacts.require("./Wallet.sol");
const DxDAOTimeLock = artifacts.require("./DxDAOTimeLock.sol");
contract('DxDAOTimeLock', accounts => {

    it("sendEther", async () => {
        var wallet =  await Wallet.new();
        await wallet.initialize(accounts[0]);
        var owner = wallet.address;
        var block = await web3.eth.getBlock("latest");
        var releaseTime = block.timestamp + (30*60*60*24);
        var dxDAOTimeLock = await DxDAOTimeLock.new(owner,releaseTime);
        assert.equal(await dxDAOTimeLock.owner(), owner);
        assert.equal(await dxDAOTimeLock.releaseTime(), releaseTime);

        //send funds to wallet
        await web3.eth.sendTransaction({from:accounts[0],to:owner, value: web3.utils.toWei('10', "ether")});
        assert.equal(await web3.eth.getBalance(owner), web3.utils.toWei('10', "ether"));
        await wallet.pay(dxDAOTimeLock.address);
        await wallet.pay(dxDAOTimeLock.address);
        assert.equal(await web3.eth.getBalance(dxDAOTimeLock.address), web3.utils.toWei('10', "ether"));

        var encodedABI = await new web3.eth.Contract(dxDAOTimeLock.abi)
                                .methods
                                .withdraw()
                                .encodeABI();

        try {
            await wallet.genericCall(dxDAOTimeLock.address, encodedABI);
            throw 'cannot withdraw before time';
        } catch (error) {
            helpers.assertVMException(error);
        }
        await helpers.increaseTime((30*60*60*24)+1);
        try {
            await dxDAOTimeLock.withdraw();
            throw 'only Owner can withdraw';
        } catch (error) {
            helpers.assertVMException(error);
        }
        await wallet.genericCall(dxDAOTimeLock.address, encodedABI);
        assert.equal(await web3.eth.getBalance(owner), web3.utils.toWei('10', "ether"));
    });
});
