import TruffleContract from 'truffle-contract';
import * as Web3 from "web3";

declare module 'daostack-arc' {
  export class Wallet {
    static new(password: string, progressCallback: (progress: number) => void) : Wallet;
    static fromEncrypted(encryptedJSON: string, password: string, progressCallback: (progress: number) => void) : Wallet

    getEncryptedJSON() : string
    getEtherBalance() : any // TODO return bignumber
    getMnemonic() : string
    getOrgTokenBalance(organizationAvatarAddress : string) : any // TODO return bignumber
    getPublicAddress() : string
    getProvider() : any
    giveOrgTokens(organizationAvatarAddress : string, numTokens : number) : null
    sendEther(accountAddress : string, numEther: number | string) : any // TODO return value
  }

  export class Organization  {
    address: string;
    name: string;
    /**
     * includes static `new` and `at`
     */
    avatar: TruffleContract;
    /**
     * Controller truffle contract
     */
    controller: TruffleContract;
    /**
     * DAOToken truffle contract
     */
    token: TruffleContract;
    /**
     * Reputation truffle contract
     */
    reputation: TruffleContract;
    /**
     * AbsoluteVote truffle contract
     */
    votingMachine: TruffleContract;

    schemes(contractName?:string);
    scheme(contractName:string);
    // checkSchemeConditions(contractName:string);
    // proposeScheme(options?);
    // proposeGlobalConstraint(options?);
    // vote(proposalId, choice, params);
    static new(options:any): Organization;
    static at(avatarAddress:string): Organization;
  }

  export interface ArcContractInfo {
      /**
       * TruffleContract as obtained via require()
       */
      contract: TruffleContract;
      address: string;
  }

  /**
   * An object with property names being a contract key and property value as the corresponding ArcContractInfo.
   * For all deployed contracts exposed by Arc.
   */
  export interface ArcDeployedContractKeys {
    SimpleContributionScheme: ArcContractInfo;
    GenesisScheme: ArcContractInfo;
    GlobalConstraintRegistrar: ArcContractInfo;
    SchemeRegistrar: ArcContractInfo;
    SimpleICO: ArcContractInfo;
    TokenCapGC: ArcContractInfo;
    UpgradeScheme: ArcContractInfo;
    AbsoluteVote: ArcContractInfo;
  }

  /**
   * ArcDeployedContractKeys, and those contracts organized by type.
   */
  export interface ArcDeployedContracts {
      allContracts : ArcDeployedContractKeys;
      /**
       * All deployed schemes
       */
      schemes: Array<ArcContractInfo>;
      /**
       * All deployed voting machines
       */
      votingMachines: Array<ArcContractInfo>;
      /**
       * All deployed global constraints
       */
      globalConstraints: Array<ArcContractInfo>;
  }

  // from arc.js
  export function configure(options): Web3;
  export function getDeployedContracts() : ArcDeployedContracts;

  // from utils.js
  export function requireContract(contractName): TruffleContract;
  export function getWeb3():Web3;
  export function getValueFromLogs(tx:any, arg:string, eventName:string, index:Number):string;
  export function getDefaultAccount():any;
}