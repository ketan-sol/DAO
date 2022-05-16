const MyToken = artifacts.require('MyToken');
const Timelock = artifacts.require('Timelock');
const Governance = artifacts.require('Governance');
const Treasury = artifacts.require('Treasury');

module.exports = async function (deployer) {
  const [executor, proposer, voter1, voter2, voter3, voter4, voter5] =
    await web3.eth.getAccounts();
  const name = 'MyToken';
  const symbol = 'MTK';
  const supply = web3.utils.toWei('1000', 'ether');

  await deployer.deploy(MyToken, name, symbol, supply);
};
