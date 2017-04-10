pragma solidity ^0.4.7;
import "../controller/Controller.sol";
import "zeppelin/contracts/ownership/Ownable.sol";
import "../controller/MintableToken.sol";
import "./GetCode.sol";

contract OrganizationsBoard is Ownable {
    Controller      public  controller;
    MintableToken   public  nativeToken;
    uint            public  fee;

    struct organization {
      string  name;
      uint    totalPromotion;
    }

    mapping(address=>organization) public orgList;
    mapping(bytes32=>bool) whiteList;

    event OrgAdded( address indexed _addrss, string _orgName); // indexed, for some reason can't index the name
    event Promotion( address indexed _addrss, uint _amount);

    function OrganizationsBoard(Controller _controller, uint _fee, string orgName) {
      controller = _controller;
      nativeToken = controller.nativeToken();
      fee = _fee;
      orgList[controller].name = orgName;
      OrgAdded(controller, orgName);
    }

    // Add a contract to the whitelist
    function add2WhiteList (bytes32 bytecode) onlyOwner {
      whiteList[bytecode] = true;
    }

    function addOrg (address orgControllerAddrss, string orgName) returns(bool) {
      // Check that the controller is a daostack controller
      // if (! whiteList[sha3(GetCode.at(orgController))]) throw;

      // Check there is enough in balance
      if (nativeToken.balanceOf(msg.sender) < fee) throw;

      // Burn and add Org:
      if (controller.burnTokens(fee, msg.sender)) {
        orgList[orgControllerAddrss].name = orgName;
        OrgAdded(orgControllerAddrss, orgName);
        return true;
      }
      return false;
    }

    function promoteOrg(address orgControllerAddrss, uint amountToBurn) returns(bool) {
      if (controller.burnTokens(amountToBurn, msg.sender)) {
        orgList[orgControllerAddrss].totalPromotion += amountToBurn;
        Promotion(orgControllerAddrss, amountToBurn);
        return true;
      }
    }
}
