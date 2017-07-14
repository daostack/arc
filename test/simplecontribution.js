import { Organization } from '../lib/organization.js';
const helpers = require('./helpers')

// var UniversalSimpleVote = artifacts.require("./UniversalSimpleVote.sol");
const SimpleContributionScheme = artifacts.require('./SimpleContributionScheme.sol');
const UniversalSimpleVote = artifacts.require('./UniversalSimpleVote.sol');
const MintableToken = artifacts.require('./MintableToken.sol');

contract('SimpleContribution', function(accounts) {

    it("Propose and accept a contribution (in progress)", async function(){
    	const founders = [accounts[0], accounts[1]];
      const repForFounders = [30, 70];
      const org = await helpers.forgeOrganization({founders, repForFounders});
      // const org = await Organization.new({founders, repForFounders});
      const avatar = org.avatar;
      const controller = org.controller;
    	const schemeRegistrar = org.schemeregistrar;
      let tx;

    	// check if indeed the registrar is registered as a scheme on  the controller
    	const isSchemeRegistered = await controller.isSchemeRegistered(schemeRegistrar.address);
    	assert.equal(isSchemeRegistered, true);

      // TODO: check if the controller is registered (has paid the fee)
      // const isControllerRegistered = await schemeRegistrar.isRegistered(org.avatar.address);
    	// assert.equal(isControllerRegistered, true);

      // TODO: check if the configuration parameters of the controller are known on the registrar


    	// we creaet a SimpleContributionScheme
    	const reputationAddress = await controller.nativeReputation();
    	const tokenAddress = await controller.nativeToken();

    	// const votingMachine = await UniversalSimpleVote.new();
      const votingMachine = org.votingMachine;

    	const votingParams = await votingMachine.hashParameters(
    		reputationAddress,
    		50, // percentage that counts as a majority
    	)
      // we also register the parameters with the voting machine
    	tx = await votingMachine.setParameters(
    		reputationAddress,
    		50, // percentage that counts as a majority
    	)



      // create a contribution Scheme
    	const contributionScheme = await SimpleContributionScheme.new(
    		tokenAddress,
    		1,
    		founders[0],
    	);

    	const contributionSchemeParams = await contributionScheme.getParametersHash(
    		0, // fee for the organisation?
    		0, // fee for the token?
    		votingParams,
    		votingMachine.address,
		  )
    	// and we propose to add the contribution scheme to controller
      const simpleContributionFee = await contributionScheme.fee();
      const simpleContributionFeeToken = await contributionScheme.nativeToken();

      // check if parametes are known in the voging machine
      const paramsRegisteredOnVotingMachine = await votingMachine.checkExistingParameters(votingParams);
      assert.equal(paramsRegisteredOnVotingMachine, true)

      // check if we our organization is registered
      const isOrganizationRegistered = await schemeRegistrar.isRegistered(avatar.address);
      assert.equal(isOrganizationRegistered, true);

    	tx = await schemeRegistrar.proposeScheme(
    		avatar.address,
    		contributionScheme.address,
    		contributionSchemeParams,
    		false, // isRegistering
        simpleContributionFeeToken,
        simpleContributionFee
    		);

    	return
      const proposalId = tx.logs[0].proposalId
      await schemeRegistrar.voteScheme(avatar.address, proposalId, true);


//         await this.genesis.voteScheme(contributionScheme.address, true, {from: founders[0]});
//         await this.genesis.voteScheme(contributionScheme.address, true, {from: founders[1]});


//         let balance0BeforeSubmission = await this.tokenInstance.balanceOf(founders[0]);
//         let reputation0BeforeSubmission = await this.reputationInstance.reputationOf(founders[0]);

//         // submit contribution - for that need to aprrove token first
//         // approve token
//         await this.tokenInstance.approve(contributionScheme.address, submissionFee);
//         await this.tokenInstance.approve(contributionScheme.address, submissionFee);
//         // submit contribution
//         let askedTokens = 5;
//         let askedReputation = 55;

//         // do the first call ofchain in order to get the return value (instead of tx)
//         let contributionId = await contributionScheme.submitContribution.call("simple contribution testing",
//                                                                               askedTokens,
//                                                                               askedReputation,
//                                                                               founders[0],
//                                                                               {'from':founders[0]});
//         // do the same call onchain
//         await contributionScheme.submitContribution("simple contribution testing",
//                                                     askedTokens,
//                                                     askedReputation,
//                                                     founders[0],
//                                                     {'from':founders[0]});

//         // vote on contribution. 2nd founder has majority
//         await contributionScheme.voteContribution(contributionId,true,{'from':founders[1]});

//         // see that submitter was paid
//         let balance0AfterSubmission = await this.tokenInstance.balanceOf(founders[0]);
//         let reputation0AfterSubmission = await this.reputationInstance.reputationOf(founders[0]);

//         assert.equal(parseInt(reputation0BeforeSubmission.valueOf()) + parseInt(askedReputation.valueOf()),
//                      parseInt(reputation0AfterSubmission.valueOf()),
//                      "contributer reputation are not as expected");


//         assert.equal(parseInt(balance0BeforeSubmission.valueOf()) + parseInt(askedTokens) - parseInt(submissionFee),
//                      parseInt(balance0AfterSubmission.valueOf()),
//                      "contributer tokens are not as expected");
    });
});
