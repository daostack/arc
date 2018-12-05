import 'allocator/arena';
export { allocate_memory };

import {
  Address,
  BigInt,
  ByteArray,
  Bytes,
  crypto,
  Entity,
  store,
  Value,
} from '@graphprotocol/graph-ts';

import { Avatar } from '../../types/UController/Avatar';
import { DAOToken } from '../../types/UController/DAOToken';
import { Reputation } from '../../types/UController/Reputation';

import * as domain from '../../domain';

import {
  AvatarContract,
  ReputationContract,
  TokenContract,
  UControllerAddGlobalConstraint,
  UControllerGlobalConstraint,
  UControllerOrganization,
  UControllerRegisterScheme,
  UControllerRemoveGlobalConstraint,
  UControllerScheme,
  UControllerUnregisterScheme,
  UControllerUpgradeController,
} from '../../types/schema';
import {
  AddGlobalConstraint,
  RegisterScheme,
  RemoveGlobalConstraint,
  UController,
  UnregisterScheme,
  UpgradeController,
} from '../../types/UController/UController';
import { concat, eventId } from '../../utils';

function insertScheme(
  uControllerAddress: Address,
  avatarAddress: Address,
  scheme: Address,
): void {
  let uController = UController.bind(uControllerAddress);
  let paramsHash = uController.getSchemeParameters(scheme, avatarAddress);
  let perms = uController.getSchemePermissions(scheme, avatarAddress);

  let ent = new UControllerScheme();
  ent.id = crypto.keccak256(concat(avatarAddress, scheme)).toHex();
  ent.avatarAddress = avatarAddress;
  ent.address = scheme;
  ent.paramsHash = paramsHash;
  /* tslint:disable:no-bitwise */
  ent.canRegisterSchemes = (perms[3] & 2) === 2;
  /* tslint:disable:no-bitwise */
  ent.canManageGlobalConstraints = (perms[3] & 4) === 4;
  /* tslint:disable:no-bitwise */
  ent.canUpgradeController = (perms[3] & 8) === 8;
  /* tslint:disable:no-bitwise */
  ent.canDelegateCall = (perms[3] & 16) === 16;

  store.set('UControllerScheme', ent.id, ent);
}

function deleteScheme(avatarAddress: Address, scheme: Address): void {
  store.remove(
    'UControllerScheme',
    crypto.keccak256(concat(avatarAddress, scheme)).toHex(),
  );
}

function insertOrganization(
  uControllerAddress: Address,
  avatarAddress: Address,
): void {
  let uController = UController.bind(uControllerAddress);
  let org = uController.organizations(avatarAddress);

  let reputationContract = new ReputationContract();
  let rep = Reputation.bind(org.value1);
  reputationContract.id = org.value1.toHex();
  reputationContract.address = org.value1;
  reputationContract.totalSupply = rep.totalSupply();
  store.set('ReputationContract', reputationContract.id, reputationContract);

  let tokenContract = new TokenContract();
  let daotoken = DAOToken.bind(org.value1);
  tokenContract.id = org.value0.toHex();
  tokenContract.address = org.value0;
  tokenContract.totalSupply = daotoken.totalSupply();
  tokenContract.owner = uControllerAddress;
  store.set('TokenContract', tokenContract.id, tokenContract);

  let ent = new UControllerOrganization();
  ent.id = avatarAddress.toHex();
  ent.avatarAddress = avatarAddress;
  ent.nativeToken = org.value0.toHex();
  ent.nativeReputation = org.value1.toHex();
  ent.controller = uControllerAddress;

  let avatarSC = Avatar.bind(avatarAddress);
  let avatar = new AvatarContract();
  avatar.id = avatarAddress.toHex();
  avatar.address = avatarAddress;
  avatar.name = avatarSC.orgName();
  avatar.nativeReputation = avatarSC.nativeReputation();
  avatar.nativeToken = avatarSC.nativeToken();
  avatar.owner = avatarSC.owner();
  avatar.balance = BigInt.fromI32(0);
  store.set('AvatarContract', avatar.id, avatar);

  store.set('UControllerOrganization', ent.id, ent);
}

function updateController(
  avatarAddress: Address,
  newController: Address,
): void {
  let ent = store.get(
    'UControllerOrganization',
    avatarAddress.toHex(),
  ) as UControllerOrganization;
  if (ent != null) {
    ent.controller = newController;
    store.set('UControllerOrganization', avatarAddress.toHex(), ent);
  }
}

function insertGlobalConstraint(
  uControllerAddress: Address,
  avatarAddress: Address,
  globalConstraint: Address,
  type: string,
): void {
  let uController = UController.bind(uControllerAddress);
  let paramsHash = uController.getGlobalConstraintParameters(
    globalConstraint,
    avatarAddress,
  );

  let ent = new UControllerGlobalConstraint();
  ent.id = crypto.keccak256(concat(avatarAddress, globalConstraint)).toHex();
  ent.avatarAddress = avatarAddress;
  ent.address = globalConstraint;
  ent.paramsHash = paramsHash;
  ent.type = type;

  store.set('UControllerGlobalConstraint', ent.id, ent);
}

function deleteGlobalConstraint(
  avatarAddress: Address,
  globalConstraint: Address,
): void {
  store.remove(
    'UControllerGlobalConstraint',
    crypto.keccak256(concat(avatarAddress, globalConstraint)).toHex(),
  );
}

export function handleRegisterScheme(event: RegisterScheme): void {
  domain.handleRegisterScheme(event);

  // Detect a new organization event by looking for the first register scheme event for that org.
  let isFirstRegister = store.get(
    'FirstRegisterScheme',
    event.params._avatar.toHex(),
  );
  if (isFirstRegister == null) {
    insertOrganization(event.address, event.params._avatar);
    store.set(
      'FirstRegisterScheme',
      event.params._avatar.toHex(),
      new Entity(),
    );
  }

  insertScheme(event.address, event.params._avatar, event.params._scheme);

  let ent = new UControllerRegisterScheme();
  ent.id = eventId(event);
  ent.txHash = event.transaction.hash;
  ent.controller = event.address;
  ent.contract = event.params._sender;
  ent.avatarAddress = event.params._avatar;
  ent.scheme = event.params._scheme;
  store.set('UControllerRegisterScheme', ent.id, ent);
}

export function handleUnregisterScheme(event: UnregisterScheme): void {
  deleteScheme(event.params._avatar, event.params._scheme);

  let ent = new UControllerUnregisterScheme();
  ent.id = eventId(event);
  ent.txHash = event.transaction.hash;
  ent.controller = event.address;
  ent.contract = event.params._sender;
  ent.avatarAddress = event.params._avatar;
  ent.scheme = event.params._scheme;
  store.set('UControllerUnregisterScheme', ent.id, ent);
}

export function handleUpgradeController(event: UpgradeController): void {
  updateController(event.params._avatar, event.params._newController);

  let ent = new UControllerUpgradeController();
  ent.id = eventId(event);
  ent.txHash = event.transaction.hash;
  ent.controller = event.params._oldController;
  ent.avatarAddress = event.params._avatar;
  ent.newController = event.params._newController;
  store.set('UControllerUpgradeController', ent.id, ent);
}

export function handleAddGlobalConstraint(event: AddGlobalConstraint): void {
  let when = event.parameters[2].value.toBigInt().toI32();
  let type: string;

  if (when === 0) {
    type = 'Pre';
  } else if (when === 1) {
    type = 'Post';
  } else {
    type = 'Both';
  }
  insertGlobalConstraint(
    event.address,
    event.params._avatar,
    event.params._globalConstraint,
    type,
  );

  let ent = new UControllerAddGlobalConstraint();
  ent.id = eventId(event);
  ent.txHash = event.transaction.hash;
  ent.controller = event.address;
  ent.avatarAddress = event.params._avatar;
  ent.globalConstraint = event.params._globalConstraint;
  ent.paramsHash = event.params._params;
  ent.type = type;

  store.set('UControllerAddGlobalConstraint', ent.id, ent);
}

export function handleRemoveGlobalConstraint(
  event: RemoveGlobalConstraint,
): void {
  deleteGlobalConstraint(event.params._avatar, event.params._globalConstraint);

  let ent = new UControllerRemoveGlobalConstraint();
  ent.id = eventId(event);
  ent.txHash = event.transaction.hash;
  ent.controller = event.address;
  ent.avatarAddress = event.params._avatar;
  ent.globalConstraint = event.params._globalConstraint;
  ent.isPre = event.params._isPre;
  store.set('UControllerRemoveGlobalConstraint', ent.id, ent);
}
