import {
  EthereumEvent,
  SmartContract,
  EthereumValue,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  I128,
  U128,
  I256,
  U256,
  H256
} from "@graphprotocol/graph-ts";

export class Approval extends EthereumEvent {
  get params(): ApprovalParams {
    return new ApprovalParams(this);
  }
}

export class ApprovalParams {
  _event: Approval;

  constructor(event: Approval) {
    this._event = event;
  }

  get owner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get spender(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get value(): U256 {
    return this._event.parameters[2].value.toU256();
  }
}

export class Transfer extends EthereumEvent {
  get params(): TransferParams {
    return new TransferParams(this);
  }
}

export class TransferParams {
  _event: Transfer;

  constructor(event: Transfer) {
    this._event = event;
  }

  get from(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get to(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get value(): U256 {
    return this._event.parameters[2].value.toU256();
  }
}

export class ERC20 extends SmartContract {
  static bind(address: Address): ERC20 {
    return new ERC20("ERC20", address);
  }

  totalSupply(): U256 {
    let result = super.call("totalSupply", []);
    return result[0].toU256();
  }

  balanceOf(_who: Address): U256 {
    let result = super.call("balanceOf", [EthereumValue.fromAddress(_who)]);
    return result[0].toU256();
  }

  allowance(_owner: Address, _spender: Address): U256 {
    let result = super.call("allowance", [
      EthereumValue.fromAddress(_owner),
      EthereumValue.fromAddress(_spender)
    ]);
    return result[0].toU256();
  }
}
