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

  const tx = await governance.propose(
    [store.address],
    [0],
    [encodedFunction],
    description,
    { from: proposer }
  );
  const id = tx.logs[0].args.proposalId;
  console.log(`Created proposal: ${id.toString()}\n`);

  proposalState = await governance.state.call(id);
  console.log(
    `Current state of proposal: ${proposalState.toString()} (Pending) \n`
  );

  const snapshot = await governance.proposalSnapshot.call(id);
  console.log(`Proposal created on block ${snapshot.toString()}`);

  const deadline = await governance.proposalDeadline.call(id);
  console.log(`Proposal deadline on block ${deadline.toString()}\n`);

  blockNumber = await web3.eth.getBlockNumber();
  console.log(`Current blocknumber: ${blockNumber}\n`);

  const quorum = await governance.quorum(blockNumber - 1);
  console.log(
    `Number of votes required to pass: ${web3.utils.fromWei(
      quorum.toString(),
      'ether'
    )}\n`
  );

  console.log('Casting Votes.... \n');

  //Voting
  //0 = against
  //1 = For
  //2 = did not vote

  vote = await governance.castVote(id, 1, { from: voter1 });
  vote = await governance.castVote(id, 1, { from: voter2 });
  vote = await governance.castVote(id, 1, { from: voter3 });
  vote = await governance.castVote(id, 0, { from: voter4 });
  vote = await governance.castVote(id, 2, { from: voter5 });

  /*
  Proposal States:
  Pending,
  Active,
  Cancelled,
  Defeated,
  Succeeded,
  Queued,
  Expired,
  Executed
  */

  proposalState = await governance.state.call(id);
  console.log(
    `Current state of proposal: ${proposalState.toString()} (Active) \n`
  );

  await token.transfer(proposer, amount, { from: executor });

  const { againstVotes, forVotes, DidNotVote } =
    await governance.proposalVotes.call(id);
  console.log(`Votes For: ${web3.utils.fromWei(forVotes.toString(), 'ether')}`);
  console.log(
    `Votes Against:  ${web3.utils.fromWei(againstVotes.toString(), 'ether')}`
  );
  console.log(
    `Votes Neutral: ${web3.utils.fromWei(DidNotVote.toString(), 'ether')}`
  );

  blockNumber = await web3.eth.getBlockNumber();
  console.log(`Current block number: ${blockNumber}\n`);

  proposalState = await governance.state.call(id);
  console.log(
    `Current state of proposal: ${proposalState.toString()} (Succeeded) \n`
  );

  const hash = web3.utils.sha3('Release funds from storage');
  await governance.queue([store.address], [0], [encodedFunction], hash, {
    from: executor,
  });

  proposalState = await governance.state.call(id);
  console.log(
    `Current state of proposal: ${proposalState.toString()} (Queued) \n`
  );

  await governance.execute([store.address], [0], [encodedFunction], hash, {
    from: executor,
  });

  proposalState = await governance.state.call(id);
  console.log(
    `Current state of proposal: ${proposalState.toString()} (Executed) \n`
  );

  isReleased = await store.isReleased();
  console.log(`Funds released?: ${isReleased}`);

  funds = await web3.getBalance(store.address);
  console.log(
    `Funds in storage: ${web3.utils.fromWei(
      forVotes.toString(),
      'ether'
    )} ETH\n`
  );

  callback();
};
