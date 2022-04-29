// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require('hardhat');
const hre = require('hardhat');

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const GovernanceToken = await hre.ethers.getContractFactory(
    'GovernanceToken'
  );
  const token = await GovernanceToken.deploy();
  await token.deployed();

  const TimeLock = await hre.ethers.getContractFactory('TimeLock');
  const lock = await TimeLock.deploy(3600, [], []);
  await lock.deployed();

  const MyGovernor = await hre.ethers.getContractFactory('MyGovernor');
  const governor = await MyGovernor.deploy(
    token.address,
    lock.address,
    1,
    5,
    4
  );
  await governor.deployed();

  console.log('Setting up roles..');

  const proposerRole = await lock.PROPOSER_ROLE();
  const executorRole = await lock.EXECUTOR_ROLE();
  const adminRole = await lock.TIMELOCK_ADMIN_ROLE();

  const proposeTrx = await lock.grantRole(proposerRole, governor.address);
  await proposeTrx.wait(1);
  const zeroAddress = '0x0000000000000000000000000000000000000000';
  const executorTrx = await lock.grantRole(executorRole, zeroAddress);
  await executorTrx.wait(1);

  const Store = await hre.ethers.getContractFactory('Store');
  const store = await Store.deploy();
  await store.deployed();
  console.log('Store contract deployed to:', store.address);
  const storeAddress = await ethers.getContractAt(store.address);
  const transferOwner = await storeAddress.transferOwnership(lock.address);
  await transferOwner.wait(1);

  console.log('Time Lock deployed to:', lock.address);
  console.log('Governance Token deployed to:', token.address);
  console.log('My Governor  deployed to:', governor.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
