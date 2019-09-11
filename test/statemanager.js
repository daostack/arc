import * as helpers from './helpers';
const constants = require('./constants');
const StateManager = artifacts.require("./StateManager.sol");
const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const ControllerCreator = artifacts.require("./ControllerCreator.sol");

export class StateManagerParams {
    constructor() {
    }
}

const setupStateManagerParams = async function (
    stateManager,
    accounts,
    genesisProtocol,
    token,
    avatar
) {
    var stateManagerParams = new StateManagerParams();
    if (genesisProtocol === true) {
        stateManagerParams.votingMachine = await helpers.setupGenesisProtocol(accounts, token, avatar, helpers.NULL_ADDRESS);
        await stateManager.setParameters(
            stateManagerParams.votingMachine.params,
            stateManagerParams.votingMachine.genesisProtocol.address);
        stateManagerParams.paramsHash = await stateManager.getParametersHash(
            stateManagerParams.votingMachine.params,
            stateManagerParams.votingMachine.genesisProtocol.address);
    } else {
        stateManagerParams.votingMachine = await helpers.setupAbsoluteVote(helpers.NULL_ADDRESS, 50, stateManager.address);
        await stateManager.setParameters(
            stateManagerParams.votingMachine.params,
            stateManagerParams.votingMachine.absoluteVote.address);
        stateManagerParams.paramsHash = await stateManager.getParametersHash(
            stateManagerParams.votingMachine.params,
            stateManagerParams.votingMachine.absoluteVote.address);
    }
    return stateManagerParams;
};

const setup = async function (accounts, genesisProtocol = false, tokenAddress = 0) {
    var testSetup = new helpers.TestSetup();
    testSetup.standardTokenMock = await ERC20Mock.new(accounts[1], 100);
    testSetup.stateManager = await StateManager.new();
    var controllerCreator = await ControllerCreator.new({ gas: constants.ARC_GAS_LIMIT });
    testSetup.daoCreator = await DaoCreator.new(controllerCreator.address, { gas: constants.ARC_GAS_LIMIT });
    if (genesisProtocol) {
        testSetup.reputationArray = [1000, 100, 0];
    } else {
        testSetup.reputationArray = [2000, 4000, 7000];
    }
    testSetup.org = await helpers.setupOrganizationWithArrays(testSetup.daoCreator, [accounts[0], accounts[1], accounts[2]], [1000, 0, 0], testSetup.reputationArray);
    testSetup.stateManagerParams = await setupStateManagerParams(
            testSetup.stateManager,
            accounts, genesisProtocol,
            tokenAddress,
            testSetup.org.avatar
        );
    var permissions = "0x00000000";
    await testSetup.daoCreator.setSchemes(
        testSetup.org.avatar.address,
        [testSetup.stateManager.address],
        [testSetup.stateManagerParams.paramsHash], [permissions], "metaData"
    );
    return testSetup;
};
contract('StateManager', accounts => {

    it("setParameters", async function () {
        var stateManager = await StateManager.new();
        var params = await setupStateManagerParams(stateManager);
        var parameters = await stateManager.parameters(params.paramsHash);
        assert.equal(parameters[1], params.votingMachine.absoluteVote.address);
    });

    it("proposeStateChange log", async function () {
        var testSetup = await setup(accounts);
        var tx = await testSetup.stateManager.proposeStateChange(
                testSetup.org.avatar.address,
                "description-hash",
                "test-state-name",
                "test-state-data"
            );
        assert.equal(tx.logs.length, 1);
        assert.equal(tx.logs[0].event, "NewStateProposal");
        assert.equal(await helpers.getValueFromLogs(tx, '_avatar', 0), testSetup.org.avatar.address, "Wrong log: _avatar");
        assert.equal(await helpers.getValueFromLogs(tx, '_intVoteInterface', 0), testSetup.stateManagerParams.votingMachine.absoluteVote.address, "Wrong log: _intVoteInterface");
        assert.equal(await helpers.getValueFromLogs(tx, '_descriptionHash', 15), "description-hash", "Wrong log: _stateDescription");
    });

    it("execute proposeStateChange", async function () {
        var testSetup = await setup(accounts);
        var tx = await testSetup.stateManager.proposeStateChange(
            testSetup.org.avatar.address,
            web3.utils.asciiToHex("description"),
            "test-state-name",
            "test-state-data"
        );
        //Vote with reputation to trigger execution
        var proposalId = await helpers.getValueFromLogs(tx, '_proposalId', 1);
        await testSetup.stateManagerParams.votingMachine.absoluteVote.vote(proposalId, 1, 0, helpers.NULL_ADDRESS, { from: accounts[2] });
        var organizationProposal = await testSetup.stateManager.stateProposals(testSetup.org.avatar.address, proposalId);
        assert.notEqual(organizationProposal[8], 0);//executionTime
        // TODO check that state changed
        assert.equal(await testSetup.stateManager.states(testSetup.org.avatar.address, "test-state-name"), "test-state-data")
    });
 
    it("call execute should revert if not from voting machine", async function () {
        var testSetup = await setup(accounts);
        var tx = await testSetup.stateManager.proposeStateChange(testSetup.org.avatar.address,
            web3.utils.asciiToHex("description"),
            "test-state-name",
            "test-state-data"
        );
        //Account with reputation try to trigger execution
        var proposalId = await helpers.getValueFromLogs(tx, '_proposalId', 1);
        try {
            await testSetup.stateManager.executeProposal(proposalId, 1);
            assert(false, 'only voting machine can call execute');
        } catch (ex) {
            helpers.assertVMException(ex);
        }
    });
});