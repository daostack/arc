import 'allocator/arena';

import { Address, BigInt, crypto, store } from '@graphprotocol/graph-ts';

// Import event types from the Token contract ABI
import {
  Approval,
  Burn,
  DAOToken,
  Mint,
  MintFinished,
  OwnershipTransferred,
  Transfer,
} from '../../types/NativeToken/DAOToken';
import { concat, equals, eventId } from '../../utils';

// Import entity types generated from the GraphQL schema
import {
  TokenApproval,
  TokenBurn,
  TokenContract,
  TokenHolder,
  TokenMint,
  TokenMintFinished,
  TokenTransfer,
} from '../../types/schema';

import * as domain from '../../domain';

function update(contract: Address, owner: Address): void {
  let token = DAOToken.bind(contract);
  let ent = new TokenHolder(crypto.keccak256(concat(contract, owner)).toHex());
  ent.contract = contract;
  ent.address = owner;
  let balance = token.balanceOf(owner);
  ent.balance = balance;

  if (!equals(balance, BigInt.fromI32(0))) {
    store.set('TokenHolder', ent.id, ent);
  } else {
    store.remove('TokenHolder', ent.id);
  }

  updateTokenContract(contract);
}

export function handleMint(event: Mint): void {
  update(event.address, event.params.to as Address);

  let ent = new TokenMint(eventId(event));
  ent.txHash = event.transaction.hash;
  ent.contract = event.address;
  ent.to = event.params.to;
  ent.amount = event.params.amount;

  store.set('TokenMint', ent.id, ent);
}

export function handleBurn(event: Burn): void {
  update(event.address, event.params.burner as Address);

  let ent = new TokenBurn(eventId(event));
  ent.txHash = event.transaction.hash;
  ent.contract = event.address;
  ent.burner = event.params.burner;
  ent.amount = event.params.value;

  store.set('TokenBurn', ent.id, ent);
}

export function handleMintFinished(event: MintFinished): void {
  let ent = new TokenMintFinished(eventId(event));
  ent.txHash = event.transaction.hash;
  ent.contract = event.address;

  store.set('TokenMintFinished', ent.id, ent);
}

export function handleTransfer(event: Transfer): void {
  domain.handleNativeTokenTransfer(event);

  update(event.address, event.params.to as Address);
  update(event.address, event.params.from as Address);
  let ent = new TokenTransfer(eventId(event));
  ent.txHash = event.transaction.hash;
  ent.contract = event.address;
  ent.from = event.params.from;
  ent.to = event.params.to;
  ent.value = event.params.value;

  store.set('TokenTransfer', ent.id, ent);
}

export function handleApproval(event: Approval): void {
  let ent = new TokenApproval(eventId(event));
  ent.txHash = event.transaction.hash;
  ent.contract = event.address;
  ent.spender = event.params.spender;
  ent.value = event.params.value;
  ent.owner = event.params.owner;

  store.set('TokenApproval', ent.id, ent);
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  updateTokenContract(event.address);
}

function updateTokenContract(contract: Address): void {
  let token = DAOToken.bind(contract);
  let tokenContract = new TokenContract(contract.toHex());
  tokenContract.address = contract;
  tokenContract.totalSupply = token.totalSupply();
  tokenContract.owner = token.owner();
  store.set('TokenContract', tokenContract.id, tokenContract);
}
