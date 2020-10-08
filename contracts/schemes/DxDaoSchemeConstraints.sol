pragma solidity 0.5.17;
import "../controller/Avatar.sol";
import "./SchemeConstraints.sol";


contract DxDaoSchemeConstraints is SchemeConstraints {

    function isAllowedToCall(
        address _contractToCall,
        bytes calldata callData,
        Avatar _avatar,
        uint256 _ethAmount) external returns(bool) {
      //do the logic
        return true;

    }

}
