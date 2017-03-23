pragma solidity ^0.4.7;
import '../controller/Controller.sol';

/*
    Employee is a schema to pay an employee a monthly salary of reputation and tokens
*/

contract Employee {

    Controller public controller;
    address public beneficary;
    uint public periodInMonths; // Month is taken is 4 weeks
    int public tokenSalary;
    int public repSalary;
    uint public salariesCollected = 0;
    uint public startDate;

    function Employee(
        Controller _controller,
        address _beneficary,
        uint _startDate,
        uint _periodInMonths,
        int _tokenSalary,
        int _repSalary) 
    {
        controller = _controller;
        beneficary = _beneficary;
        startDate = _startDate;
        periodInMonths = _periodInMonths;
        tokenSalary = _tokenSalary;
        repSalary = _repSalary;
    }

    function collectSalary() returns(bool) {

        if (now < startDate) throw;
        
        // employee cannot collect more salaries than stipulated
        if (salariesCollected >= periodInMonths) throw;

        // employee cannot collect her salary before period has passed
        if ((now - startDate) < 4 weeks * salariesCollected) throw;

        // Pay:
        salariesCollected += 1;
        if(!controller.mintTokens(tokenSalary, beneficary)) throw;
        if(!controller.mintReputation(repSalary, beneficary)) throw;

        return false;
    }
}
