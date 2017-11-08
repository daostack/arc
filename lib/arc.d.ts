declare module 'emergent-arc' {
  export class Wallet {
    static new(password: string, progressCallback: (progress: number) => null) : Wallet;
    static fromEncrypted(encryptedJSON: string, password: string, progressCallback: (progress: number) => null) : Wallet

    getEncryptedJSON() : string
    getEtherBalance() : any // TODO return bignumber
    getMnemonic() : string
    getOrgTokenBalance(organizationAvatarAddress : string) : any // TODO return bignumber
    getPublicAddress() : string
    getProvider() : any
    giveOrgTokens(organizationAvatarAddress : string, numTokens : number) : null
    sendEther(accountAddress : string, numEther: number | string) : any // TODO return value
  }
}