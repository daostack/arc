import { Address, BigInt, Bytes, Entity, ByteArray, crypto, store } from '@graphprotocol/graph-ts'

export function concat(a: ByteArray, b: ByteArray): ByteArray {
  let out = new Uint8Array(a.length + b.length)
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i]
  }
  for (let j = 0; j < b.length; j++) {
    out[a.length + j] = b[j]
  }
  return out as ByteArray
}

export function updateRedemption(beneficiary: Address, avatar: Address, amount: BigInt, proposalId: Bytes, rewardType: ByteArray, rewardString: String): void {
  let accountId = crypto.keccak256(concat(beneficiary, avatar))
  let rewardId = crypto.keccak256(concat(rewardType, amount as ByteArray))

  let uniqueId = crypto.keccak256(concat(proposalId, concat(accountId, rewardId))).toHex()

  let redemption = store.get('Redemption', uniqueId)
  if (redemption == null) {
    redemption = new Entity()
    redemption.setString('accountId', accountId.toHex())
    redemption.setString('proposalId', proposalId.toHex())
    redemption.setString('rewardId', rewardId.toHex())
    store.set('Redemption', uniqueId, redemption as Entity)
  }

  let reward = store.get('Reward', rewardId.toHex())
  if (reward == null) {
    reward = new Entity()
    reward.setString('id', rewardId.toHex())
    reward.setString('type', rewardString)
    reward.setBigInt('amount', amount)

    store.set('Reward', rewardId.toHex(), reward as Entity)
  }
}

export const zero256 = "0x0000000000000000000000000000000000000000000000000000000000000000"

export function isZero(num: BigInt): boolean {
  for (let i = 0; i < num.length; i++) {
      if (num[i] != 0) {
        return false;
      }
    }
    return true;
}
