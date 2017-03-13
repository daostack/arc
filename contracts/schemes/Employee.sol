pragma solidity ^0.4.7;
import '../controller/Controller.sol';

contract Employee {
  Controller public controller;
  address empAddrss;
  uint startDate;
  uint periodInMonths; // Month is taken is 4 weeks
  int tokenSallery;
  int repSallery;
  uint salleriesColleted;

  function Employee(Controller _controller, address _empAddrss, uint _startDate, uint _periodInMonths, int _tokenSallery, int _repSallery) {
    controller = _controller;
    empAddrss = _empAddrss;
    startDate = _startDate;
    periodInMonths = _periodInMonths;
    tokenSallery = _tokenSallery;
    repSallery = _repSallery;
  }

  function collectSallery() returns(bool) {
    if (msg.sender != empAddrss) throw;
    if (now < startDate) throw;
    if (salleriesColleted >= periodInMonths) throw;

    // Pay:
    if ((now - startDate) > 4 weeks * salleriesColleted) {
      salleriesColleted += 1;
      if( ! controller.mintTokens( tokenSallery, msg.sender ) ) throw;
      if( ! controller.mintReputation( repSallery, msg.sender ) ) throw;
      return true;
    }

    // Too early to pay:
    return false;
  }
}
