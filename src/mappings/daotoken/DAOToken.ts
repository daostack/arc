import 'allocator/arena';
export { allocate_memory };

import { Address, crypto, store } from '@graphprotocol/graph-ts';

// Import event types from the Token contract ABI
import { Approval,
         Burn,
         DAOToken ,
         Mint,
         MintFinished,
         OwnershipTransferred,
         Transfer,
       } from '../../types/DAOToken/DAOToken';
import { concat, isZero } from '../../utils';

// Import entity types generated from the GraphQL schema
import { TokenApproval,
         TokenBurn,
         TokenContract,
         TokenHolder,
         TokenMint,
         TokenMintFinished,
         TokenTransfer,
       } from '../../types/schema';

function update(contract: Address, owner: Address): void {
    let token = DAOToken.bind(contract);
    let ent = new TokenHolder();
    let id = crypto.keccak256(concat(contract, owner)).toHex();
    //  ent.id = id;
    ent.contract = contract;
    ent.address = owner;
    let balance = token.balanceOf(owner);
    ent.balance = balance;

    if (!isZero(balance)) {
        store.set('TokenHolder', id, ent);
    } else {
        store.remove('TokenHolder', id);
    }

    updateTokenContract(contract);
}

export function handleMint(event: Mint): void {
    update(event.address, event.params.to as Address);

    let ent = new TokenMint();
    ent.txHash = event.transaction.hash;
    ent.contract = event.address;
    ent.to = event.params.to;
    ent.amount = event.params.amount;

    store.set('TokenMint', event.transaction.hash.toHex(), ent);

}

export function handleBurn(event: Burn): void {
    update(event.address, event.params.burner as Address);

    let ent = new TokenBurn();
    // TODO: txHash is not unique
    ent.txHash = event.transaction.hash;
    ent.contract = event.address;
    ent.burner = event.params.burner;
    ent.amount = event.params.value;

    store.set('TokenBurn', event.transaction.hash.toHex(), ent);
}

export function handleMintFinished(event: MintFinished): void {

    let ent = new TokenMintFinished();
    // TODO: txHash is not unique
    ent.txHash = event.transaction.hash;
    ent.contract = event.address;

    store.set('TokenMintFinished', event.transaction.hash.toHex(), ent);
}

export function handleTransfer(event: Transfer): void {

    update(event.address, event.params.to as Address);
    update(event.address, event.params.from as Address);
    let ent = new TokenTransfer();
    // TODO: txHash is not unique
    ent.txHash = event.transaction.hash;
    ent.contract = event.address;
    ent.from = event.params.from;
    ent.to = event.params.to;
    ent.value = event.params.value;

    store.set('TokenTransfer', event.transaction.hash.toHex(), ent);
}

export function handleApproval(event: Approval): void {

    let ent = new TokenApproval();
    // TODO: txHash is not unique
    ent.txHash = event.transaction.hash;
    ent.contract = event.address;
    ent.spender = event.params.spender;
    ent.value = event.params.value;
    ent.owner = event.params.owner;

    store.set('TokenApproval', event.transaction.hash.toHex(), ent);
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
    updateTokenContract(event.address);
}

function updateTokenContract(contract: Address): void {
    let token = DAOToken.bind(contract);
    let tokenContract = new TokenContract();
    tokenContract.address = contract;
    tokenContract.totalSupply = token.totalSupply();
    tokenContract.owner = token.owner();
    store.set('TokenContract', contract.toHex(), tokenContract);
}
