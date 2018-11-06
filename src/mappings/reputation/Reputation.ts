import 'allocator/arena'
export { allocate_memory }

import { Address,store, crypto, } from '@graphprotocol/graph-ts'

// Import event types from the Reputation contract ABI
import { Mint, Burn ,Reputation} from '../../types/Reputation/Reputation'
import { concat, zero256, isZero } from '../../utils'

// Import entity types generated from the GraphQL schema
import { ReputationHolder, ReputationMint , ReputationBurn, ReputationContract } from '../../types/schema'

function update(contract: Address, owner: Address): void {
    let rep = Reputation.bind(contract);
    let ent = new ReputationHolder();
    let id = crypto.keccak256(concat(contract, owner)).toHex();
  //  ent.id = id;
    ent.contract = contract;
    ent.address = owner;
    let balance = rep.balanceOf(owner);
    ent.balance = balance;


    if (!isZero(balance)) {
        store.set('ReputationHolder', id, ent);
    } else {
        store.remove('ReputationHolder', id);
    }

    let reputationContract = new ReputationContract();
    reputationContract.address  = contract;
    reputationContract.totalSupply =  rep.totalSupply();
    store.set('ReputationContract', contract.toHex(), reputationContract);
}

export function handleMint(event: Mint): void {
    update(event.address , event.params._to as Address);

    let ent = new ReputationMint();
    // TODO: txHash is not unique
    //ent.id = event.transaction.hash.toHex();
    ent.txHash = event.transaction.hash;
    ent.contract =  event.address;
    ent.address = event.params._to;
    ent.amount = event.params._amount;

    store.set('ReputationMint', event.transaction.hash.toHex(), ent);

}

export function handleBurn(event: Burn): void {
    update(event.address, event.params._from as Address);

    let ent = new ReputationBurn();
    // TODO: txHash is not unique
    ent.txHash = event.transaction.hash;
    ent.contract =  event.address;
    ent.address = event.params._from;
    ent.amount = event.params._amount;

    store.set('ReputationBurn', event.transaction.hash.toHex(), ent);
}
