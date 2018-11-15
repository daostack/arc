import 'allocator/arena';
export { allocate_memory };

import { Address, BigInt, store } from '@graphprotocol/graph-ts';

// Import event types from the Token contract ABI
import { Avatar, ReceiveEther, SendEther } from '../../types/Avatar/Avatar';

// Import entity types generated from the GraphQL schema
import { AvatarContract } from '../../types/schema';

import { addition, sub } from '../../utils';

function handleAvatarBalance(address: Address, value: BigInt, received: boolean): void {
  let avatarSC = Avatar.bind(address);

  let avatar = store.get('AvatarContract', address.toHex()) as AvatarContract;
  if (avatar == null) {
    avatar = new AvatarContract();
    // avatar.id = address.toHex();
    avatar.address = address;
    avatar.name = avatarSC.orgName();
    avatar.nativeReputation = avatarSC.nativeReputation();
    avatar.nativeToken = avatarSC.nativeToken();
    avatar.owner = avatarSC.owner();
    avatar.balance = BigInt.fromI32(0);
  }

  if (received) {
    avatar.balance = addition(avatar.balance, value);
  } else {
    avatar.balance = sub(avatar.balance, value);
  }

  store.set('AvatarContract', address.toHex(), avatar);
}

export function handleSendEth(event: SendEther): void {
  handleAvatarBalance(event.address, event.params._amountInWei, false);
}
export function handleReceiveEth(event: ReceiveEther): void {
  handleAvatarBalance(event.address, event.params._value, true);
}
