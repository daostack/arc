import { Address, BigInt, crypto, store } from '@graphprotocol/graph-ts';
import { Reputation } from '../types/NativeReputation/Reputation';
import { DAOToken } from '../types/NativeToken/DAOToken';
import { Member } from '../types/schema';
import { concat, equals, hexToAddress } from '../utils';
import { getDAO } from './dao';

export function getMember(address: Address, daoAddress: Address): Member {
  let id = crypto.keccak256(concat(address, daoAddress)).toHex();
  let member = store.get('Member', id) as Member;
  if (member == null) {
    member = new Member();
    member.id = id;
    member.address = address;
    member.dao = daoAddress.toHex();
    member.reputation = BigInt.fromI32(0);
  }
  return member;
}

export function saveMember(member: Member): void {
  store.set('Member', member.id, member);
}

export function deleteMember(member: Member): void {
  store.remove('Member', member.id);
}

export function updateMemberReputation(
  address: Address,
  daoAddress: Address,
): void {
  let dao = getDAO(daoAddress.toHex());
  let reputation = Reputation.bind(hexToAddress(dao.nativeReputation));
  let member = getMember(address, daoAddress);
  member.reputation = reputation.balanceOf(address);
  if (equals(member.reputation as BigInt, BigInt.fromI32(0))) {
    deleteMember(member);
  } else {
    saveMember(member);
  }
}

export function updateMemberTokens(
  address: Address,
  daoAddress: Address,
): void {
  let dao = getDAO(daoAddress.toHex());
  let token = DAOToken.bind(hexToAddress(dao.nativeToken));
  let member = getMember(address, daoAddress);
  member.tokens = token.balanceOf(address);
  saveMember(member);
}
