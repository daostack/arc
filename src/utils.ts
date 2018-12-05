import {
  Address,
  BigInt,
  ByteArray,
  crypto,
  Entity,
  EthereumEvent,
  store,
  Value,
} from '@graphprotocol/graph-ts';

export function concat(a: ByteArray, b: ByteArray): ByteArray {
  let out = new Uint8Array(a.length + b.length);
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i];
  }
  for (let j = 0; j < b.length; j++) {
    out[a.length + j] = b[j];
  }
  return out as ByteArray;
}

export function eventId(event: EthereumEvent): string {
  return crypto
    .keccak256(
      concat(event.transaction.hash, event.transactionLogIndex as ByteArray),
    )
    .toHex();
}

export function hexToAddress(hex: string): Address {
  return Address.fromString(hex.substr(2));
}

/**
 * WORKAROUND: there's no `console.log` functionality in mapping.
 * so we use `debug(..)` which writes a `Debug` entity to the store so you can see them in graphiql.
 */
let debugId = 0;
export function debug(msg: string): void {
  let ent = new Entity();
  let id = BigInt.fromI32(debugId).toHex();
  ent.set('id', Value.fromString(id));
  ent.set('message', Value.fromString(msg));
  store.set('Debug', id, ent);
  debugId++;
}

export function equals(a: BigInt, b: BigInt): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
