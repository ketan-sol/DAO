const MyToken = artifacts.require('MyToken');
const TimeLock = artifacts.require('TimeLock');
const Governance = artifacts.require('Governance');
const Store = artifacts.require('Store');

module.exports = async function (callback) {
  const [executor, proposer, voter1, voter2, voter3, voter4, voter5] =
    await web3.eth.getAccounts();
  let isReleased, funds, blockNumber, proposalState, vote;

  const amount = web3.utils.toWei('5', 'ether');
  const token = await MyToken.deployed();
  await token.delegate(voter1, { from: voter1 });
  await token.delegate(voter2, { from: voter2 });
  await token.delegate(voter3, { from: voter3 });
  await token.delegate(voter4, { from: voter4 });
  await token.delegate(voter5, { from: voter5 });

  const store = await Store.deployed();
  isReleased = await store.isReleased();
  console.log(`Funds release? ${isReleased}`);

  funds = await web3.eth.getBalance(store.address);
  console.log(
    `Funds inside of store: ${web3.utils.fromWei(
      funds.toString(),
      'ether'
    )} ETH\n`
  );

  const governance = await Governance.deployed();
  const encodedFunction = await store.contract.methods
    .releaseFunds()
    .encodeABI();
  const description = 'Release funds from storage';
};
