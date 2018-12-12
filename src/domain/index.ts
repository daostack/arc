// Required for dynamic memory allocation in WASM / AssemblyScript
import 'allocator/arena';

import { Address, BigInt, Entity, store, Value } from '@graphprotocol/graph-ts';
import {
  NewContributionProposal,
  ProposalExecuted,
} from '../types/ContributionReward/ContributionReward';
import {
  ExecuteProposal,
  NewProposal,
  Stake,
  VoteProposal,
} from '../types/GenesisProtocol/GenesisProtocol';
import { Burn, Mint } from '../types/NativeReputation/Reputation';
import { Transfer } from '../types/NativeToken/DAOToken';
import { RegisterScheme } from '../types/UController/UController';
import { equals, eventId, hexToAddress } from '../utils';
import { insertNewDAO } from './dao';
import { updateMemberReputation, updateMemberTokens } from './member';
import {
  getProposal,
  parseOutcome,
  saveProposal,
  updateCRProposal,
  updateGPProposal,
  updateProposal,
  updateProposalExecution,
} from './proposal';
import {
  getReputation,
  insertReputation,
  updateReputationTotalSupply,
} from './reputation';
import { insertStake } from './stake';
import { getToken, insertToken, updateTokenTotalSupply } from './token';
import { insertVote } from './vote';

export function handleNewProposal(event: NewProposal): void {
  updateGPProposal(
    event.address,
    event.params._proposalId,
    event.params._proposer,
    event.params._organization,
    event.params._paramsHash,
  );
}

export function handleNewContributionProposal(
  event: NewContributionProposal,
): void {
  let rewards = event.params._rewards;
  let tokensReward = rewards.shift();
  let ethReward = rewards.shift();
  let externalTokenReward = rewards.shift();
  let periodLength = rewards.shift();
  let periods = rewards.shift();

  updateCRProposal(
    event.params._proposalId,
    event.block.timestamp,
    event.params._avatar,
    event.params._beneficiary,
    event.params._contributionDescription,
    periodLength,
    periods,
    event.params._reputationChange,
    tokensReward,
    ethReward,
    event.params._externalToken,
    externalTokenReward,
  );
}

export function handleStake(event: Stake): void {
  let proposal = getProposal(event.params._proposalId.toHex());
  updateProposal(proposal, event.address, event.params._proposalId);
  if (equals(event.params._vote, BigInt.fromI32(1))) {
    proposal.stakesFor = proposal.stakesFor.plus(event.params._amount);
  } else {
    proposal.stakesAgainst = proposal.stakesAgainst.plus(event.params._amount);
  }
  saveProposal(proposal);
  insertStake(
    eventId(event),
    event.block.timestamp,
    event.params._staker,
    event.params._amount,
    event.params._proposalId.toHex(),
    parseOutcome(event.params._vote),
  );
}

export function handleVoteProposal(event: VoteProposal): void {
  let proposal = getProposal(event.params._proposalId.toHex());
  updateProposal(proposal, event.address, event.params._proposalId);
  if (equals(event.params._vote, BigInt.fromI32(1))) {
    proposal.votesFor = proposal.votesFor.plus(event.params._reputation);
  } else {
    proposal.votesAgainst = proposal.votesAgainst.plus(
      event.params._reputation,
    );
  }
  saveProposal(proposal);
  insertVote(
    eventId(event),
    event.block.timestamp,
    event.params._voter,
    event.params._organization,
    event.params._proposalId.toHex(),
    parseOutcome(event.params._vote),
    event.params._reputation,
  );
}

export function handleProposalExecuted(event: ProposalExecuted): void {
  updateProposalExecution(event.params._proposalId, event.block.timestamp);
}

export function handleRegisterScheme(event: RegisterScheme): void {
  // Detect the first register scheme event which indicates a new DAO
  let isFirstRegister = store.get(
    'FirstRegisterSchemeFlag',
    event.params._avatar.toHex(),
  );
  if (isFirstRegister == null) {
    let dao = insertNewDAO(event.address, event.params._avatar);
    insertToken(hexToAddress(dao.nativeToken), event.params._avatar.toHex());
    insertReputation(
      hexToAddress(dao.nativeReputation),
      event.params._avatar.toHex(),
    );

    let ent = new Entity();
    ent.set('id', Value.fromString(event.params._avatar.toHex()));
    store.set('FirstRegisterSchemeFlag', event.params._avatar.toHex(), ent);
  }
}

export function handleMint(event: Mint): void {
  let rep = getReputation(event.address.toHex());
  if (rep.dao == null) {
    // reputation that's not attached to a DAO
    return;
  }

  updateMemberReputation(event.params._to, hexToAddress(rep.dao));
  updateReputationTotalSupply(event.address);
}

export function handleBurn(event: Burn): void {
  let dao = getReputation(event.address.toHex()).dao;
  if (dao == null) {
    // reputation that's not attached to a DAO
    return;
  }
  updateMemberReputation(event.params._from, hexToAddress(dao));
  updateReputationTotalSupply(event.address);
}

export function handleNativeTokenTransfer(event: Transfer): void {
  let dao = getToken(event.address.toHex()).dao;
  if (dao == null) {
    // reputation that's not attached to a DAO
    return;
  }

  updateMemberTokens(event.params.from, hexToAddress(dao));
  updateMemberTokens(event.params.to, hexToAddress(dao));
  updateTokenTotalSupply(event.address);
}

export function handleExecuteProposal(event: ExecuteProposal): void {
  let proposal = getProposal(event.params._proposalId.toHex());
  updateProposal(proposal, event.address, event.params._proposalId);
}
