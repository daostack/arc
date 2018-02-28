const DAOTokenERC20 = artifacts.require("./DAOTokenERC20.sol");
const DAOTokenERC827 = artifacts.require("./DAOTokenERC827.sol");
const DAOTokenMiniMe = artifacts.require("./DAOTokenMiniMe.sol");
const MiniMeTokenFactory = artifacts.require("MiniMeTokenFactory");


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

  /*
    function totalSupply() public view returns (uint256);
    function balanceOf(address who) public view returns (uint256);
    function transfer(address to, uint256 value) public returns (bool);
    function allowance(address owner, address spender) public view returns (uint256);
    function transferFrom(address from, address to, uint256 value) public returns (bool);
    function approve(address spender, uint256 value) public returns (bool);
   */

  const gas = {};
  const instance = await deploy();
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

module.exports = async (callback) => {
  const ERC20 = await report(() => DAOTokenERC20.new("TokenName", "TKN"));
  const ERC827 = await report(() => DAOTokenERC20.new("TokenName", "TKN"));
  /*
        address _tokenFactory,
        address _parentToken,
        uint _parentSnapShotBlock,
        string _tokenName,
        uint8 _decimalUnits,
        string _tokenSymbol,
        bool _transfersEnabled
  */

  const MiniMe = await report(async () => {
      const factory = await MiniMeTokenFactory.new();
      const instance = await DAOTokenMiniMe.new(factory.address,0, 0, "TokenName", 18, "TKN", true);
      return instance;
  });
  console.log('ERC20',ERC20);
  console.log('ERC827',ERC827);
  console.log('MiniMe',MiniMe);
  //await report('MiniMe', DAOTokenMiniMe, "TokenName", "TKN");
  callback();
};
