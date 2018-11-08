import { getWeb3, getContractAddresses, getOptions, query } from "./util";

const ContributionReward = require('@daostack/arc/build/contracts/ContributionReward.json');
const DAOToken = require('@daostack/arc/build/contracts/DAOToken.json');
const Reputation = require('@daostack/arc/build/contracts/Reputation.json');
const Avatar = require('@daostack/arc/build/contracts/Avatar.json');
const UController = require('@daostack/arc/build/contracts/UController.json');
const AbsoluteVote = require('@daostack/arc/build/contracts/AbsoluteVote.json');
const EthTransferHelper = require('./helpers/EthTransferHelper.json');

describe('ContributionReward', () => {
    let web3, addresses, opts, contributionReward;
    beforeAll(async () => {
        web3 = await getWeb3();
        addresses = getContractAddresses();
        opts = await getOptions(web3);
        contributionReward = new web3.eth.Contract(ContributionReward.abi, addresses.ContributionReward, opts);
    });

    it('Sanity', async () => {
        const accounts = web3.eth.accounts.wallet;

        // START long setup ...
        const externalToken = await new web3.eth.Contract(DAOToken.abi, undefined, opts)
            .deploy({ data: DAOToken.bytecode, arguments: ['Test Token', 'TST', '10000000000'] })
            .send();
        await externalToken.methods.mint(accounts[0].address, '100000').send();

        const nativeToken = await new web3.eth.Contract(DAOToken.abi, undefined, opts)
            .deploy({ data: DAOToken.bytecode, arguments: ['Test Token', 'TST', '10000000000'] })
            .send();

        const reputation = await new web3.eth.Contract(Reputation.abi, undefined, opts)
            .deploy({ data: Reputation.bytecode, arguments: [] })
            .send();
        await reputation.methods.mint(accounts[1].address, 100000).send(); // to be able to pass a vote

        const avatar = await new web3.eth.Contract(Avatar.abi, undefined, opts)
            .deploy({ data: Avatar.bytecode, arguments: ['Test', nativeToken.options.address, reputation.options.address] })
            .send();
        await externalToken.methods.transfer(avatar.options.address, '100000').send();

        const controller = await new web3.eth.Contract(UController.abi, undefined, opts)
            .deploy({ data: UController.bytecode, arguments: [] })
            .send();

        const absVote = await new web3.eth.Contract(AbsoluteVote.abi, undefined, opts)
            .deploy({ data: AbsoluteVote.bytecode, arguments: [] })
            .send();

        //use this till the sendTransaction issue will be solved :)
        const ethTransferHelper = await new web3.eth.Contract(EthTransferHelper.abi, undefined, opts)
            .deploy({ data: EthTransferHelper.bytecode, arguments: [] })
            .send();

        const setParams = absVote.methods.setParameters(20, true);
        const absVoteParamsHash = await setParams.call()
        await setParams.send()
        const crSetParams = contributionReward.methods.setParameters(0, absVoteParamsHash, absVote.options.address);
        const paramsHash = await crSetParams.call();
        await crSetParams.send()
        await reputation.methods.transferOwnership(controller.options.address).send();
        await nativeToken.methods.transferOwnership(controller.options.address).send();
        await avatar.methods.transferOwnership(controller.options.address).send();

        await controller.methods.newOrganization(avatar.options.address).send();
        await controller.methods.registerScheme(
            contributionReward.options.address,
            paramsHash,
            '0x0000001F', // full permissions,
            avatar.options.address
        ).send();
        // END setup

        const descHash = '0x0000000000000000000000000000000000000000000000000000000000000123';
        const rewards = {
            rep: 1,
            nativeToken: 2,
            externalToken: 3,
            eth: 4,
            periods: 5,
            periodLength: 13
        }
        const propose = contributionReward.methods.proposeContributionReward(
            avatar.options.address,
            descHash,
            rewards.rep,
            [
                rewards.nativeToken,
                rewards.eth,
                rewards.externalToken,
                rewards.periodLength,
                rewards.periods
            ],
            externalToken.options.address,
            accounts[1].address
        );
        const proposalId = await propose.call();
        const { transactionHash: proposaTxHash } = await propose.send();

        const { contributionRewardNewContributionProposals } = await query(`{
            contributionRewardNewContributionProposals {
              txHash,
              contract,
              avatar,
              beneficiary,
              descriptionHash,
              externalToken,
              votingMachine,
              proposalId,
              reputationReward,
              nativeTokenReward,
              ethReward,
              externalTokenReward,
              periods,
              periodLength
            }
        }`);

        expect(contributionRewardNewContributionProposals.length).toEqual(1);
        expect(contributionRewardNewContributionProposals).toContainEqual({
            txHash: proposaTxHash,
            proposalId,
            contract: contributionReward.options.address.toLowerCase(),
            avatar: avatar.options.address.toLowerCase(),
            beneficiary: accounts[1].address.toLowerCase(),
            descriptionHash: descHash,
            externalToken: externalToken.options.address.toLowerCase(),
            votingMachine: absVote.options.address.toLowerCase(),
            reputationReward: rewards.rep.toString(),
            nativeTokenReward: rewards.nativeToken.toString(),
            ethReward: rewards.eth.toString(),
            externalTokenReward: rewards.externalToken.toString(),
            periods: rewards.periods.toString(),
            periodLength: rewards.periodLength.toString()
        })

        let { contributionRewardProposals } = await query(`{
            contributionRewardProposals {
                proposalId,
                contract,
                avatar,
                beneficiary,
                descriptionHash,
                externalToken,
                votingMachine,
                reputationReward,
                nativeTokenReward,
                ethReward,
                externalTokenReward,
                periods,
                periodLength,
                executedAt,
                alreadyRedeemedReputationPeriods,
                alreadyRedeemedNativeTokenPeriods,
                alreadyRedeemedEthPeriods,
                alreadyRedeemedExternalTokenPeriods
            }
        }`);

        expect(contributionRewardProposals.length).toEqual(1);
        expect(contributionRewardProposals).toContainEqual({
            proposalId,
            contract: contributionReward.options.address.toLowerCase(),
            avatar: avatar.options.address.toLowerCase(),
            beneficiary: accounts[1].address.toLowerCase(),
            descriptionHash: descHash,
            externalToken: externalToken.options.address.toLowerCase(),
            votingMachine: absVote.options.address.toLowerCase(),
            reputationReward: rewards.rep.toString(),
            nativeTokenReward: rewards.nativeToken.toString(),
            ethReward: rewards.eth.toString(),
            externalTokenReward: rewards.externalToken.toString(),
            periods: rewards.periods.toString(),
            periodLength: rewards.periodLength.toString(),
            executedAt: null,
            alreadyRedeemedReputationPeriods: null,
            alreadyRedeemedNativeTokenPeriods: null,
            alreadyRedeemedEthPeriods: null,
            alreadyRedeemedExternalTokenPeriods: null
        });

        //pass the proposal
        const { transactionHash: executeTxHash, blockNumber } = await absVote.methods.vote(proposalId, 1, accounts[0].address /* unused by the contract */).send({ from: accounts[1].address });
        const block = await web3.eth.getBlock(blockNumber);

        const { contributionRewardProposalResolveds } = await query(`{
            contributionRewardProposalResolveds {
              txHash
              contract
              avatar
              proposalId
              passed
            }
        }`);

        expect(contributionRewardProposalResolveds.length).toEqual(1);
        expect(contributionRewardProposalResolveds).toContainEqual({
            txHash: executeTxHash,
            contract: contributionReward.options.address.toLowerCase(),
            avatar: avatar.options.address.toLowerCase(),
            passed: true,
            proposalId
        });

        contributionRewardProposals = (await query(`{
            contributionRewardProposals {
                executedAt
            }
        }`)).contributionRewardProposals;

        expect(contributionRewardProposals.length).toEqual(1);
        expect(contributionRewardProposals).toContainEqual({
            executedAt: block.timestamp.toString()
        });

        //wait 2 periods
        await new Promise(res => setTimeout(res, rewards.periodLength * 2 * 1000))
        const { transactionHash: redeemReputationTxHash } = await contributionReward.methods.redeemReputation(proposalId, avatar.options.address).send();

        const { contributionRewardRedeemReputations } = await query(`{
            contributionRewardRedeemReputations {
              txHash,
              contract,
              avatar,
              beneficiary,
              proposalId,
              amount
            }
        }`);

        expect(contributionRewardRedeemReputations.length).toEqual(1);
        expect(contributionRewardRedeemReputations).toContainEqual({
            txHash: redeemReputationTxHash,
            contract: contributionReward.options.address.toLowerCase(),
            avatar: avatar.options.address.toLowerCase(),
            beneficiary: accounts[1].address.toLowerCase(),
            proposalId,
            amount: (rewards.rep * 2).toString()
        })

        contributionRewardProposals = (await query(`{
            contributionRewardProposals {
                alreadyRedeemedReputationPeriods
            }
        }`)).contributionRewardProposals;

        expect(contributionRewardProposals.length).toEqual(1);
        expect(contributionRewardProposals).toContainEqual({
            alreadyRedeemedReputationPeriods: '2'
        });

        const { transactionHash: redeemNativeTokenTxHash } = await contributionReward.methods.redeemNativeToken(proposalId, avatar.options.address).send();

        const { contributionRewardRedeemNativeTokens } = await query(`{
            contributionRewardRedeemNativeTokens {
              txHash,
              contract,
              avatar,
              beneficiary,
              proposalId,
              amount
            }
        }`);

        expect(contributionRewardRedeemNativeTokens.length).toEqual(1);
        expect(contributionRewardRedeemNativeTokens).toContainEqual({
            txHash: redeemNativeTokenTxHash,
            contract: contributionReward.options.address.toLowerCase(),
            avatar: avatar.options.address.toLowerCase(),
            beneficiary: accounts[1].address.toLowerCase(),
            proposalId,
            amount: (rewards.nativeToken * 2).toString()
        })

        contributionRewardProposals = (await query(`{
            contributionRewardProposals {
                alreadyRedeemedNativeTokenPeriods
            }
        }`)).contributionRewardProposals;

        expect(contributionRewardProposals.length).toEqual(1);
        expect(contributionRewardProposals).toContainEqual({
            alreadyRedeemedNativeTokenPeriods: '2'
        });

        const { transactionHash: redeemExternalTokenTxHash } = await contributionReward.methods.redeemExternalToken(proposalId, avatar.options.address).send();

        const { contributionRewardRedeemExternalTokens } = await query(`{
            contributionRewardRedeemExternalTokens {
              txHash,
              contract,
              avatar,
              beneficiary,
              proposalId,
              amount
            }
        }`);

        expect(contributionRewardRedeemExternalTokens.length).toEqual(1);
        expect(contributionRewardRedeemExternalTokens).toContainEqual({
            txHash: redeemExternalTokenTxHash,
            contract: contributionReward.options.address.toLowerCase(),
            avatar: avatar.options.address.toLowerCase(),
            beneficiary: accounts[1].address.toLowerCase(),
            proposalId,
            amount: (rewards.externalToken * 2).toString()
        })

        contributionRewardProposals = (await query(`{
            contributionRewardProposals {
                alreadyRedeemedExternalTokenPeriods
            }
        }`)).contributionRewardProposals;

        expect(contributionRewardProposals.length).toEqual(1);
        expect(contributionRewardProposals).toContainEqual({
            alreadyRedeemedExternalTokenPeriods: '2'
        });

        // TODO: This is failing for some reason probably due to bug in ganache or graph - node
        // from graph-node logs:
        // Trying again after block polling failed: could not get block from Ethereum: Decoder error: Error("invalid type: null, expected a 0x-prefixed hex-encoded vector of bytes", line: 0, column: 0)
        //await web3.eth.sendTransaction({ from: accounts[0].address, to: avatar.options.address, value: web3.utils.toWei('10', "ether"),gas:50000});
        await ethTransferHelper.methods.transfer(avatar.options.address).send({ value: web3.utils.toWei('10', "ether") });
        //
        const { transactionHash: redeemEtherTxHash } = await contributionReward.methods.redeemEther(proposalId, avatar.options.address).send({gas:1000000});

        var receipt = await web3.eth.getTransactionReceipt(redeemEtherTxHash);

        var amountRedeemed =0;
        await contributionReward.getPastEvents('RedeemEther', {
              fromBlock: receipt.blockNumber,
              toBlock: 'latest'
          })
          .then(function(events){
              amountRedeemed = events[0].returnValues._amount;
          });

        const { contributionRewardRedeemEthers } = await query(`{
            contributionRewardRedeemEthers {
              txHash,
              contract,
              avatar,
              beneficiary,
              proposalId,
              amount
            }
        }`);

        expect(contributionRewardRedeemEthers.length).toEqual(1);
        expect(contributionRewardRedeemEthers).toContainEqual({
            txHash: redeemEtherTxHash,
            contract: contributionReward.options.address.toLowerCase(),
            avatar: avatar.options.address.toLowerCase(),
            beneficiary: accounts[1].address.toLowerCase(),
            proposalId,
            amount: (amountRedeemed).toString()
        })

        contributionRewardProposals = (await query(`{
            contributionRewardProposals {
                alreadyRedeemedEthPeriods
            }
        }`)).contributionRewardProposals;

        expect(contributionRewardProposals.length).toEqual(1);
        expect(contributionRewardProposals).toContainEqual({
            alreadyRedeemedEthPeriods: '2'
        });

    }, 100000)
})
