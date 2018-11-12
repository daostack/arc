import 'allocator/arena';
export { allocate_memory };

import {
  Address,
  BigInt,
  ByteArray,
  Bytes,
  crypto,
  EthereumValue,
  SmartContract,
  store,
} from '@graphprotocol/graph-ts';

import {
  ExecuteProposal,
  GenesisProtocol,
  GPExecuteProposal,
  NewProposal,
  Redeem,
  RedeemDaoBounty,
  RedeemReputation,
  Stake,
  VoteProposal,
} from '../../types/GenesisProtocol/GenesisProtocol';

import { addition, concat } from '../../utils';

import {
  GenesisProtocolExecuteProposal,
  GenesisProtocolGPExecuteProposal,
  GenesisProtocolProposal,
  GenesisProtocolRedemption,
  GenesisProtocolReward,
  GenesisProtocolStake,
  GenesisProtocolVote,
} from '../../types/schema';

export function handleNewProposal(event: NewProposal): void {
  let ent = new GenesisProtocolProposal();
  ent.proposalId = event.params._proposalId.toHex();
  ent.submittedTime = event.block.timestamp;
  ent.proposer = event.params._proposer;
  ent.daoAvatarAddress = event.params._organization;
  ent.numOfChoices = event.params._numOfChoices;

  store.set('GenesisProtocolProposal', event.params._proposalId.toHex(), ent);
}

export function handleVoteProposal(event: VoteProposal): void {
  let ent = new GenesisProtocolVote();
  let uniqueId = concat(event.params._proposalId, event.params._voter).toHex();

  let vote = store.get('GenesisProtocolVote', uniqueId) as GenesisProtocolVote;
  if (vote == null) {
    ent.avatarAddress = event.params._organization;
    ent.reputation = event.params._reputation;
    ent.voterAddress = event.params._voter;
    ent.voteOption = event.params._vote;
    ent.proposalId = event.params._proposalId.toHex();
  } else {
    // Is it possible someone will use 50% for one voteOption and rest for the other
    vote.reputation = addition(vote.reputation, event.params._reputation);
    store.set('GenesisProtocolVote', uniqueId, vote);
    return;
  }

  store.set('GenesisProtocolVote', uniqueId, ent);
}

export function handleStake(event: Stake): void {
  let ent = new GenesisProtocolStake();
  let uniqueId = concat(event.params._proposalId, event.params._staker).toHex();

  let stake = store.get(
    'GenesisProtocolStake',
    uniqueId,
  ) as GenesisProtocolStake;

  if (stake == null) {
    ent.avatarAddress = event.params._organization;
    ent.stakeAmount = event.params._amount;
    ent.stakerAddress = event.params._staker;
    ent.prediction = event.params._vote;
    ent.proposalId = event.params._proposalId.toHex();
  } else {
    // Is it possible someone will use 50% for one voteOption and rest for the other
    stake.stakeAmount = addition(stake.stakeAmount, event.params._amount);
    store.set('GenesisProtocolStake', uniqueId, stake);
    return;
  }

  let proposal = store.get(
    'GenesisProtocolProposal',
    event.params._proposalId.toHex(),
  ) as GenesisProtocolProposal;

  proposal.state = state(event.params._proposalId, event.address).toI32();

  store.set(
    'GenesisProtocolProposal',
    event.params._proposalId.toHex(),
    proposal,
  );

  store.set('GPStake', uniqueId, ent);
}

export function handleGPExecuteProposal(event: GPExecuteProposal): void {
  let proposal = store.get(
    'GenesisProtocolProposal',
    event.params._proposalId.toHex(),
  ) as GenesisProtocolProposal;
  // todo: figure out why reading uint8 event param does not work .
  // this is a workaround to by pass the auto generated getter.
  proposal.executionState = event.parameters[1].value.toBigInt().toI32();
  store.set(
    'GenesisProtocolProposal',
    event.params._proposalId.toHex(),
    proposal,
  );

  let genesisProtocolGPExecuteProposal = new GenesisProtocolGPExecuteProposal();
  genesisProtocolGPExecuteProposal.executionState = event.parameters[1].value
    .toBigInt()
    .toI32();
  genesisProtocolGPExecuteProposal.contract = event.address;
  genesisProtocolGPExecuteProposal.proposalId = event.params._proposalId;
  genesisProtocolGPExecuteProposal.txHash = event.transaction.hash.toHex();
  store.set(
    'GenesisProtocolGPExecuteProposal',
    event.transaction.hash.toHex(),
    genesisProtocolGPExecuteProposal,
  );
}

export function handleExecuteProposal(event: ExecuteProposal): void {
  let proposal = store.get(
    'GenesisProtocolProposal',
    event.params._proposalId.toHex(),
  ) as GenesisProtocolProposal;

  proposal.executionTime = event.block.timestamp;
  proposal.decision = event.params._decision;
  proposal.totalReputation = event.params._totalReputation;
  // todo:figure out why reading uint8 param does not work .
  // for now use a workaround.
  // https://github.com/graphprotocol/graph-node/issues/569
  proposal.state = state(event.params._proposalId, event.address).toI32();
  store.set(
    'GenesisProtocolProposal',
    event.params._proposalId.toHex(),
    proposal,
  );

  let genesisProtocolExecuteProposal = new GenesisProtocolExecuteProposal();
  genesisProtocolExecuteProposal.decision = event.params._decision;
  genesisProtocolExecuteProposal.contract = event.address;
  genesisProtocolExecuteProposal.organization = event.params._organization;
  genesisProtocolExecuteProposal.proposalId = event.params._proposalId;
  genesisProtocolExecuteProposal.totalReputation =
    event.params._totalReputation;
  genesisProtocolExecuteProposal.txHash = event.transaction.hash.toHex();
  store.set(
    'GenesisProtocolExecuteProposal',
    event.transaction.hash.toHex(),
    genesisProtocolExecuteProposal,
  );
}

export function handleRedeem(event: Redeem): void {
  let rewardType = new Uint8Array(1);
  rewardType[0] = 5;
  updateRedemption(
    event.params._beneficiary,
    event.params._organization,
    event.params._amount,
    event.params._proposalId,
    rewardType as ByteArray,
    'gpGen',
  );
}

export function handleRedeemDaoBounty(event: RedeemDaoBounty): void {
  let rewardType = new Uint8Array(1);
  rewardType[0] = 6;
  updateRedemption(
    event.params._beneficiary,
    event.params._organization,
    event.params._amount,
    event.params._proposalId,
    rewardType as ByteArray,
    'gpBounty',
  );
}

export function handleRedeemReputation(event: RedeemReputation): void {
  let rewardType = new Uint8Array(1);
  rewardType[0] = 4;
  updateRedemption(
    event.params._beneficiary,
    event.params._organization,
    event.params._amount,
    event.params._proposalId,
    rewardType as ByteArray,
    'gpRep',
  );
}

function updateRedemption(
  beneficiary: Address,
  avatar: Address,
  amount: BigInt,
  proposalId: Bytes,
  rewardType: ByteArray,
  rewardString: string,
): void {
  let accountId = crypto.keccak256(concat(beneficiary, avatar));

  let rewardId = crypto.keccak256(concat(rewardType, amount as ByteArray));

  let uniqueId = crypto
    .keccak256(concat(proposalId, concat(accountId, rewardId)))
    .toHex();

  let redemption = store.get(
    'GenesisProtocolRedemption',
    uniqueId,
  ) as GenesisProtocolRedemption;
  if (redemption == null) {
    redemption = new GenesisProtocolRedemption();
    redemption.redeemer = beneficiary;
    redemption.proposalId = proposalId.toHex();
    redemption.rewardId = rewardId.toHex();
    store.set('GenesisProtocolRedemption', uniqueId, redemption);
  }

  let reward = store.get(
    'GenesisProtocolReward',
    rewardId.toHex(),
  ) as GenesisProtocolReward;
  if (reward == null) {
    reward = new GenesisProtocolReward();
    reward.id = rewardId.toHex();
    reward.type = rewardString.toString();
    reward.amount = amount;

    store.set('GenesisProtocolReward', rewardId.toHex(), reward);
  }
}

function state(proposalId: Bytes, address: Address): BigInt {
  let genesisProtocol = new SmartContract('GenesisProtocol', address);
  let result = genesisProtocol.call('state', [
    EthereumValue.fromFixedBytes(proposalId),
  ]);
  return result[0].toBigInt();
}
