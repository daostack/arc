// Required for dynamic memory allocation in WASM / AssemblyScript
import 'allocator/arena'
export { allocate_memory }

// Import types and APIs from graph-ts
import { Entity, Value, store, crypto, ByteArray } from '@graphprotocol/graph-ts'

import { GenesisProtocol, NewProposal } from './types/GP/GenesisProtocol';

// Handler for Transfer events
export function newProposal(event: NewProposal): void {
  let ent = new Entity();
  ent.setAddress('address', event.address);
  ent.setU256('nChoices', event.params._numOfChoices);
  ent.setAddress('organization', event.params._organization);
  ent.setBytes('paramsHash', event.params._paramsHash);
  ent.setAddress('proposer', event.params._proposer);
  store.set('Proposal', event.params._proposalId.toHex(), ent);
}

// Helper for concatenating two byte arrays
function concat(a: ByteArray, b: ByteArray): ByteArray {
  let out = new Uint8Array(a.length + b.length)
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i]
  }
  for (let j = 0; j < b.length; j++) {
    out[a.length + j] = b[j]
  }
  return out as ByteArray
}
