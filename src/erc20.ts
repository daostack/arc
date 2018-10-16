// Required for dynamic memory allocation in WASM / AssemblyScript
import 'allocator/arena'
export { allocate_memory }

// Import types and APIs from graph-ts
import { Entity, Value, store, crypto, ByteArray } from '@graphprotocol/graph-ts'

import { Approval, Transfer, ERC20 } from './types/GEN/ERC20';

// Handler for Transfer events
export function transfer(event: Transfer): void {
  const erc20 = ERC20.bind(event.address);

  const from = new Entity();
  const fromId = concat(event.address, event.params.from).toHex();
  from.setString('id', fromId)
  from.setAddress('contract', event.address);
  from.setAddress('owner', event.params.from);
  from.setU256('balance', erc20.balanceOf(event.params.from));
  store.set('ERC20_balance', fromId, from);

  const to = new Entity();
  const toId = concat(event.address, event.params.to).toHex();
  to.setString('id', toId);
  to.setAddress('contract', event.address);
  to.setAddress('owner', event.params.to);
  to.setU256('balance', erc20.balanceOf(event.params.to));
  store.set('ERC20_balance', toId, to);
}

// Handler for Approval events
export function approval(event: Approval): void {
  // To be implemented
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
