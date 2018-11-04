import 'allocator/arena'
export { allocate_memory }

import { Entity, Address, Value, store, crypto, ByteArray, U256 } from '@graphprotocol/graph-ts'

import { Reputation, Mint, Burn } from '../types/Reputation/Reputation'
import { concat, zero256, isZero } from '../utils'

function update(contract: Address, owner: Address): void {
    let rep = Reputation.bind(contract);
    let ent = new Entity();
    let id = crypto.keccak256(concat(contract, owner)).toHex();
    ent.setString('id', id);
    ent.setAddress('contract', contract);
    ent.setAddress('address', owner);
    let balance = rep.balanceOf(owner);
    ent.setU256('balance', balance);


    if (!isZero(balance)) {
        store.set('ReputationHolder', id, ent);
    } else {
        store.remove('ReputationHolder', id);
    }

    let repEnt = new Entity();
    repEnt.setAddress('address', contract);
    repEnt.setU256('totalSupply', rep.totalSupply());
    store.set('Reputation', contract.toHex(), repEnt);
}

export function handleMint(event: Mint): void {
    update(event.address, event.params._to);

    let ent = new Entity();
    // TODO: txHash is not unique
    ent.setString('id', event.transaction.hash.toHex());
    ent.setString('txHash', event.transaction.hash.toHex());
    ent.setAddress('contract', event.address);
    ent.setAddress('address', event.params._to);
    ent.setU256('amount', event.params._amount);

    store.set('ReputationMint', event.transaction.hash.toHex(), ent);

}

export function handleBurn(event: Burn): void {
    update(event.address, event.params._from);

    let ent = new Entity();
    // TODO: txHash is not unique
    ent.setString('id', event.transaction.hash.toHex());
    ent.setString('txHash', event.transaction.hash.toHex());
    ent.setAddress('contract', event.address);
    ent.setAddress('address', event.params._from);
    ent.setU256('amount', event.params._amount);

    store.set('ReputationBurn', event.transaction.hash.toHex(), ent);
}
