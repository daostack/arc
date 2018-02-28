const DAOToken = artifacts.require("./DAOToken.sol");
const DAOTokenERC827 = artifacts.require("./DAOTokenERC827.sol");
const DAOTokenMiniMe = artifacts.require("./DAOTokenMiniMe.sol");
const MiniMeTokenFactory = artifacts.require("MiniMeTokenFactory");

const deploy = async (Token,...args) => {
  const result = web3.eth.estimateGas({data: Token.binary});
  const instance = await Token.new(...args);
  return {instance, gas: result};
};

const report = async (deploy) => {

  const mint = async (instance) => {
    const result = await instance.mint.estimateGas(web3.eth.accounts[0],10000);
    await instance.mint(web3.eth.accounts[0],10000);
    return result;
  };

  const burn = async (instance) => {
    const result = await instance.burn.estimateGas(5000, {from: web3.eth.accounts[0]});
    return result;
  };

  const totalSupply = async (instance) => {
    const result = await instance.totalSupply.estimateGas();
    return result;
  };

  const balanceOf = async (instance) => {
    const result = await instance.balanceOf.estimateGas(web3.eth.accounts[0]);
    return result;
  };

  const transfer = async (instance) => {
    const result = await instance.transfer.estimateGas(web3.eth.accounts[1],1000);
    return result;
  };

  const approve = async (instance) => {
    const result = await instance.approve.estimateGas(web3.eth.accounts[1], 2000, {from: web3.eth.accounts[0]});
    await instance.approve(web3.eth.accounts[1], 2000, {from: web3.eth.accounts[0]});
    return result;
  };

  const allowance = async (instance) => {
    const result = await instance.allowance.estimateGas(web3.eth.accounts[0],web3.eth.accounts[1]);
    return result;
  };

  const transferFrom = async (instance) => {
    const result = await instance.transferFrom.estimateGas(web3.eth.accounts[0], web3.eth.accounts[1], 500, {from: web3.eth.accounts[1]});
    return result;
  };

  const gas = {};
  const {instance,gas: deployGas} = await deploy();
  gas.deploy = deployGas;
  gas.mint = await mint(instance);
  gas.burn = await burn(instance);
  gas.totalSupply = await totalSupply(instance);
  gas.balanceOf = await balanceOf(instance);
  gas.transfer = await transfer(instance);
  gas.approve = await approve(instance);
  gas.allowance = await allowance(instance);
  gas.transferFrom = await transferFrom(instance);
  return gas;
};

module.exports = async (finished) => {
  const ERC20 = await report(()=>deploy(DAOToken, "TokenName", "TKN"));
  const ERC827 = await report(()=>deploy(DAOTokenERC827, "TokenName", "TKN"));

  const deployDAOTokenMiniMe = async () => {
    const factory = await MiniMeTokenFactory.new();
    const instance = await DAOTokenMiniMe.new(factory.address, 0, 0, "TokenName", 18, "TKN", true);
    await instance.changeController(web3.eth.accounts[0]);

    const transfersEnabled = await instance.transfersEnabled();
    console.log('transfersEnabled',transfersEnabled);

    const result = web3.eth.estimateGas({data: DAOTokenMiniMe.binary});
    return {instance, gas: result};
  };

  const MiniMe = await report(deployDAOTokenMiniMe);

  const line = (...args) => console.log(args.reduce((acc,arg) => acc + ' ' + (arg + '').padEnd(13),''));

  line('function','ERC20','ERC827','Diff(%)','MiniMe','Diff(%)');
  line('========','=====','======','=======','======','=======');
  for(let key in ERC20){
    const erc20 = ERC20[key];
    const erc827 = ERC827[key];
    const minime = MiniMe[key];

    const diff = (comparedTo) => {
      const percent = 100*(comparedTo - erc20)/erc20;
      return `${percent<0?'':'+'}${percent.toFixed(1)}%`;
    };

    line(key,erc20,erc827,diff(erc827),minime,diff(minime));
  }

  finished();
};
