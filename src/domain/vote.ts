import { Address, BigInt, store } from '@graphprotocol/graph-ts';
import { ProposalVote } from '../types/schema';
import { getMember } from './member';

export function getVote(id: string): ProposalVote {
  let stake = store.get('ProposalVote', id) as ProposalVote;
  if (stake == null) {
    stake = new ProposalVote();
    stake.id = id;
  }
  return stake;
}

export function saveVote(vote: ProposalVote): void {
  store.set('ProposalVote', vote.id, vote);
}

export function insertVote(
  eventId: string,
  timestamp: BigInt,
  voter: Address,
  avatarAddress: Address,
  proposalId: string,
  outcome: string,
  reputation: BigInt,
): void {
  let vote = getVote(eventId);
  vote.createdAt = timestamp;
  vote.member = getMember(voter, avatarAddress).id;
  vote.reputation = reputation;
  vote.proposal = proposalId;
  vote.outcome = outcome;
  saveVote(vote);
}
