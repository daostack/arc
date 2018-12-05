import { Address, BigInt, Bytes, crypto, store } from '@graphprotocol/graph-ts';
import { GenesisProtocol } from '../types/GenesisProtocol/GenesisProtocol';
import { Proposal } from '../types/schema';
import { concat, equals } from '../utils';
import { getMember } from './member';

export function parseOutcome(num: BigInt): string {
  if (equals(num, BigInt.fromI32(1))) {
    // Yes
    return 'Pass';
  } else {
    // No
    return 'Fail';
  }
}

export function getProposal(id: string): Proposal {
  let proposal = store.get('Proposal', id) as Proposal;
  if (proposal == null) {
    proposal = new Proposal();
    proposal.id = id;

    proposal.stage = 'Open';

    proposal.votesFor = BigInt.fromI32(0);
    proposal.votesAgainst = BigInt.fromI32(0);
    proposal.winningOutcome = 'Fail';

    proposal.stakesFor = BigInt.fromI32(0);
    proposal.stakesAgainst = BigInt.fromI32(0);
  }

  return proposal;
}

export function saveProposal(proposal: Proposal): void {
  store.set('Proposal', proposal.id, proposal);
}

export function updateProposal(
  proposal: Proposal,
  gpAddress: Address,
  proposalId: Bytes,
): void {
  let gp = GenesisProtocol.bind(gpAddress);
  let gpProposal = gp.proposals(proposalId);

  // proposal.boostedPhaseTime
  if (!equals(gpProposal.value5, BigInt.fromI32(0))) {
    if (proposal.boostedAt == null) {
      proposal.boostedAt = gpProposal.value5;
    } else if (!equals(proposal.boostedAt as BigInt, gpProposal.value5)) {
      proposal.quietEndingPeriodBeganAt = gpProposal.value5;
    }
  }

  // proposal.winningVote
  proposal.winningOutcome = parseOutcome(gpProposal.value7);

  // proposal.state
  let state = gpProposal.value6;
  if (state === 1) {
    // Closed
    proposal.stage = 'Resolved';
  } else if (state === 2) {
    // Executed
    proposal.stage = 'Resolved';
  } else if (state === 3) {
    // PreBoosted
    proposal.stage = 'Open';
  } else if (state === 4) {
    // Boosted
    proposal.stage = 'Boosted';
  } else if (state === 5) {
    // QuietEndingPeriod
    proposal.stage = 'QuietEndingPeriod';
  }
}

export function updateGPProposal(
  gpAddress: Address,
  proposalId: Bytes,
  proposer: Address,
  avatarAddress: Address,
  paramsHash: Bytes,
): void {
  let gp = GenesisProtocol.bind(gpAddress);
  let proposal = getProposal(proposalId.toHex());
  proposal.proposer = getMember(proposer, avatarAddress).id;
  proposal.dao = avatarAddress.toHex();
  let params = gp.parameters(paramsHash);
  proposal.preBoostedVoteRequiredPercentage = params.value0; // preBoostedVoteRequiredPercentage
  proposal.preBoostedVotePeriodLimit = params.value1; // preBoostedVotePeriodLimit
  proposal.boostedVotePeriodLimit = params.value2; // boostedVotePeriodLimit
  proposal.thresholdConstA = params.value3; // thresholdConstA
  proposal.thresholdConstB = params.value4; // thresholdConstB
  proposal.minimumStakingFee = params.value5; // minimumStakingFee
  proposal.quietEndingPeriod = params.value6; // quietEndingPeriod
  proposal.proposingRepRewardConstA = params.value7; // proposingRepRewardConstA
  proposal.proposingRepRewardConstB = params.value8; // proposingRepRewardConstB
  proposal.stakerFeeRatioForVoters = params.value9; // stakerFeeRatioForVoters
  proposal.votersReputationLossRatio = params.value10; // votersReputationLossRatio
  proposal.votersGainRepRatioFromLostRep = params.value11; // votersGainRepRatioFromLostRep
  proposal.voteOnBehalf = params.value12; // address voteOnBehalf
  saveProposal(proposal);
}

export function updateCRProposal(
  proposalId: Bytes,
  createdAt: BigInt,
  avatarAddress: Address,
  beneficiary: Address,
  ipfsHash: Bytes,
  periodLength: BigInt,
  periods: BigInt,
  reputationReward: BigInt,
  tokensReward: BigInt,
  ethReward: BigInt,
  externalToken: Address,
  externalTokenReward: BigInt,
): void {
  let proposal = getProposal(proposalId.toHex());
  proposal.dao = avatarAddress.toHex();
  proposal.beneficiary = beneficiary;
  proposal.reputationReward = reputationReward;
  proposal.createdAt = createdAt;

  proposal.tokensReward = tokensReward;
  proposal.ethReward = ethReward;
  proposal.externalTokenReward = externalTokenReward;
  proposal.periodLength = periodLength;
  proposal.periods = periods;
  proposal.externalToken = externalToken;
  proposal.ipfsHash = ipfsHash;
  saveProposal(proposal);
}

export function updateProposalExecution(
  proposalId: Bytes,
  timestamp: BigInt,
): void {
  let proposal = getProposal(proposalId.toHex());
  proposal.executedAt = timestamp;
  saveProposal(proposal);
}
