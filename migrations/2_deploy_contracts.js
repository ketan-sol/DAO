const MyToken = artifacts.require('MyToken');
const Timelock = artifacts.require('Timelock');
const Governance = artifacts.require('Governance');
const Store = artifacts.require('Store');

module.exports = async function (deployer) {
  const [executor, proposer, voter1, voter2, voter3, voter4, voter5] =
    await web3.eth.getAccounts();
  const name = 'MyToken';
  const symbol = 'MTK';
  const supply = web3.utils.toWei('1000', 'ether');

  await deployer.deploy(MyToken, name, symbol, supply);
  const token = await MyToken.deployed();

  //send 50 tokens to each voter
  const amount = web3.utils.toWei('50', 'ether');
  await token.transfer(voter1, amount, { from: executor });
  await token.transfer(voter2, amount, { from: executor });
  await token.transfer(voter3, amount, { from: executor });
  await token.transfer(voter4, amount, { from: executor });
  await token.transfer(voter5, amount, { from: executor });

  const minDelay = 1;

  await deployer.deploy(Timelock, minDelay, [proposer], [executor]);
  const timelock = await Timelock.deployed();

  const quoram = 5; //% of total supply of tokens needed for approval
  const votingDelay = 0; //number of blocks after proposal until voting becomes active
  const votingPeriod = 5; //number of blocks voting will stay open

  await deployer.deploy(
    Governance,
    token.address,
    timelock.address,
    quoram,
    votingDelay,
    votingPeriod
  );
  const governance = await Governance.deployed();

  //deploying store

  const funds = web3.utils.toWei('25', 'ether');
  await deployer.deploy(Store, executor, { value: funds });
  const store = await Store.deployed();
  await store.transferOwnership(timelock.address, { from: executor });

  //assigning roles
  const proposerRole = await timelock.PROPERSER_ROLE();
  const executorRole = await timelock.EXECUTOR_ROLE();

  await timelock.grantRole(proposerRole, governance.address, {
    from: executor,
  });
  await timelock.grantRole(executorRole, governance.address, {
    from: executor,
  });
};
