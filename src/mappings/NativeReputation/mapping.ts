import 'allocator/arena';
export { allocate_memory };

import { Address, BigInt, crypto, store } from '@graphprotocol/graph-ts';

// Import event types from the Reputation contract ABI
import {
  Burn,
  Mint,
  Reputation,
} from '../../types/NativeReputation/Reputation';
import { concat, equals, eventId } from '../../utils';

import * as domain from '../../domain';

// Import entity types generated from the GraphQL schema
import {
  ReputationBurn,
  ReputationContract,
  ReputationHolder,
  ReputationMint,
} from '../../types/schema';

function update(contract: Address, owner: Address): void {
  let rep = Reputation.bind(contract);
  let ent = new ReputationHolder();
  ent.id = crypto.keccak256(concat(contract, owner)).toHex();
  ent.contract = contract;
  ent.address = owner;
  let balance = rep.balanceOf(owner);
  ent.balance = balance;

  if (!equals(balance, BigInt.fromI32(0))) {
    store.set('ReputationHolder', ent.id, ent);
  } else {
    store.remove('ReputationHolder', ent.id);
  }

  let reputationContract = new ReputationContract();
  reputationContract.id = contract.toHex();
  reputationContract.address = contract;
  reputationContract.totalSupply = rep.totalSupply();
  store.set('ReputationContract', reputationContract.id, reputationContract);
}

export function handleMint(event: Mint): void {
  domain.handleMint(event);
  update(event.address, event.params._to as Address);

  let ent = new ReputationMint();
  ent.id = eventId(event);
  ent.txHash = event.transaction.hash;
  ent.contract = event.address;
  ent.address = event.params._to;
  ent.amount = event.params._amount;

  store.set('ReputationMint', ent.id, ent);
}

export function handleBurn(event: Burn): void {
  domain.handleBurn(event);
  update(event.address, event.params._from as Address);

  let ent = new ReputationBurn();
  ent.id = eventId(event);
  ent.txHash = event.transaction.hash;
  ent.contract = event.address;
  ent.address = event.params._from;
  ent.amount = event.params._amount;

  store.set('ReputationBurn', ent.id, ent);
}
