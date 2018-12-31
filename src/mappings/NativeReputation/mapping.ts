import 'allocator/arena';

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
  let ent = new ReputationHolder(crypto.keccak256(concat(contract, owner)).toHex());
  ent.contract = contract;
  ent.address = owner;
  let balance = rep.balanceOf(owner);
  ent.balance = balance;

  let reputationContract = ReputationContract.load(contract.toHex());

  if (reputationContract == null) {
    reputationContract = new ReputationContract(contract.toHex());
    reputationContract.reputationHolders = new Array<String>()
  }

  let reputationHolders = reputationContract.reputationHolders;

  if (!equals(balance, BigInt.fromI32(0))) {
    store.set('ReputationHolder', ent.id, ent);
    reputationHolders.push(ent.id);
  } else {
    store.remove('ReputationHolder', ent.id);
  }
  reputationContract.reputationHolders = reputationHolders;
  reputationContract.address = contract;
  reputationContract.totalSupply = rep.totalSupply();
  reputationContract.save();
}

export function handleMint(event: Mint): void {
  domain.handleMint(event);
  update(event.address, event.params._to as Address);

  let ent = new ReputationMint(eventId(event));
  ent.txHash = event.transaction.hash;
  ent.contract = event.address;
  ent.address = event.params._to;
  ent.amount = event.params._amount;

  store.set('ReputationMint', ent.id, ent);
}

export function handleBurn(event: Burn): void {
  domain.handleBurn(event);
  update(event.address, event.params._from as Address);

  let ent = new ReputationBurn(eventId(event));
  ent.txHash = event.transaction.hash;
  ent.contract = event.address;
  ent.address = event.params._from;
  ent.amount = event.params._amount;

  store.set('ReputationBurn', ent.id, ent);
}
