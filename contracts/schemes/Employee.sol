pragma solidity ^0.4.7;
import '../controller/Controller.sol';


contract Employee {
    Controller public controller;
    address empAddress;
    uint periodInMonths; // Month is taken is 4 weeks
    int tokenSalary;
    int repSalary;
    uint salariesCollected;

    function Employee(Controller _controller, address _empAddress, uint _startDate, uint _periodInMonths, int _tokenSalary, int _repSalary) {
        controller = _controller;
        empAddress = _empAddress;
        startDate = _startDate;
        periodInMonths = _periodInMonths;
        tokenSalary = _tokenSalary;
        repSalary = _repSalary;
    }

    function collectSalary() returns(bool) {
        if (msg.sender != empAddrss) throw;
        if (now < startDate) throw;
        if (salariesCollected >= periodInMonths) throw;

        // Pay:
        if ((now - startDate) > 4 weeks * salariesCollected) {
          salariesCollected += 1;
          if(!controller.mintTokens(tokenSalary, msg.sender)) throw;
          if(!controller.mintReputation(tokenSalary, msg.sender)) throw;
          return true;
        }

      // Too early to pay:
      return false;
    }
}
