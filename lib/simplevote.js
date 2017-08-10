//
import { ExtendTruffleContract } from './utils.js';
const SoliditySimpleVote = artifacts.require("./SimpleVote.sol");

class SimpleVote extends ExtendTruffleContract(SoliditySimpleVote){

  async vote(proposalId) {
    // check preconditions for voting
    proposalInfo = await this.contract.proposals(proposalId);
    // console.log(proposalInfo);
    // a propsoal has the following structure
    // 0. address owner;
    // 1. address avatar;
    // 2. ExecutableInterface executable;
    // 3. bytes32 paramsHash;
    // 4. uint yes; // total 'yes' votes
    // 5. uint no; // total 'no' votes
    // MAPPING is skipped in the reutnr value...
    // X.mapping(address=>int) voted; // save the amount of reputation voted by an agent (positive sign is yes, negatice is no)
    // 6. bool opened; // voting opened flag
    // 7. bool ended; // voting had ended flag
    // the prposal must be opened, but not ended
    assert.ok(proposalInfo[6]); // proposal.opened is true
    assert.notOk(proposalInfo[7]); // proposal.Ended is false
    // call this.contract.vote(proposalId, ...);
  }
}

export { SimpleVote };
