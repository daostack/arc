pragma solidity ^0.4.7;
import '../controller/Controller.sol';
import '../zeppelin-solidity/Ownable.sol';
import '../controller/MintableToken.sol';
import './GetCode.sol';

contract OrganizationsBoard is Ownable {
    Controller      controller;
    MintableToken   nativeToken;
    uint            fee;

    mapping(address=>bool) public orgList;
    mapping(bytes32=>bool) whiteList;

    function OrganizationBoard(Controller _controller, uint _fee) {
      controller = _controller;
      nativeToken = controller.nativeToken();
      orgList[controller] = true;
      fee = _fee;
    }

    // Add a contract to the whitelist
    function add2WhiteList (bytes32 bytecode) onlyOwner {
      whiteList[bytecode] = true;
    }

    function addOrg (Controller orgController) returns(bool) {
      // Not sure how to access the bytecode, made something up for now:
      /*if (! whiteList[sha3(GetCode.at(orgController))]) throw;*/

      // Check there is enough in balance
      if (nativeToken.balanceOf(msg.sender) < fee) throw;

      if (controller.mintTokens(-int(fee), msg.sender)) {
        orgList[orgController] = true;
        return true;
      } else {
        return false;
      }

    }

}
