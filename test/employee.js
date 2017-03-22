const helpers = require('./helpers')

var Employee = artifacts.require("./Employee.sol");
var SimpleContribution = artifacts.require("./SimpleContribution.sol");

contract('Employee', function(accounts) {
    it("should respect basic sanity", async function() {
        let submissionFee = 0;
            
        await helpers.setupController(this)
        let empAddress = accounts[4]
        let repSalary = 10
        let tokenSalary = 1414
        // set up a distribution scheme for minting tokens
        let employee = await Employee.new(
            this.controllerAddress, // _controller
            empAddress, // _empAddress
            new Date().getTime()/1000, // _startDate - seems solidity clock is less precise
            11, // periodInMonths
            tokenSalary, // _tokenSalary
            repSalary // _repSalary
            );

        let _repSalary = await employee.repSalary()
        assert.equal(_repSalary, repSalary)

        // the scheme is not registered at this point, so paying a salary should fail
        try {
            await employee.collectSalary();
            throw 'an error' // make sure that an error is thrown
        } catch(error) {
            helpers.assertJumpOrOutOfGas(error)
        }

        // now we register the scheme
        await this.genesis.proposeScheme(employee.address);
        await this.genesis.voteScheme(employee.address, true, {from: this.founders[1]});

        await employee.collectSalary()
        // // now the employee should have gotten her salary
        let reputationAfterPayment = await this.reputationInstance.reputationOf(empAddress);
        assert.equal(reputationAfterPayment, repSalary)
        let tokensAfterPayment = await this.tokenInstance.balanceOf(empAddress);
        assert.equal(tokensAfterPayment, tokenSalary)

        // collecting the salary another time will throw an error
        try {
            await employee.collectSalary();
            throw 'an error' // make sure that an error is thrown
        } catch(error) {
            helpers.assertJumpOrOutOfGas(error)
        }

    })

    it("should not pay before startDate", async function() {
        await helpers.setupController(this)
        let empAddress = accounts[4]
        let repSalary = 10
        let tokenSalary = 1414
        // set up a distribution scheme for minting tokens
        let employee = await Employee.new(
            this.controllerAddress, // _controller
            empAddress, // _empAddress
            (new Date().getTime()/1000) + 1000, // _startDate 1000 secs in the future 
            11, // periodInMonths
            tokenSalary, // _tokenSalary
            repSalary // _repSalary
            );
        // register the scheme
        await this.genesis.proposeScheme(employee.address);
        await this.genesis.voteScheme(employee.address, true, {from: this.founders[1]});   

        // the startDate is in the future, and so a salary should not be payed
        try {
            await employee.collectSalary();
            throw 'an error' // make sure that an error is thrown
        } catch(error) {
            helpers.assertJumpOrOutOfGas(error)
        }
    })
});
