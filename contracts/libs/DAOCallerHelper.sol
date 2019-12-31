pragma solidity 0.5.15;
import "../dao/DAO.sol";


/**
 * @title reputation allocation contract
 * This scheme can be used to allocate a pre define amount of reputation to whitelisted
 * beneficiaries.
 * this contract can be used as the rep mapping contract for  RepitationFromToken contract.
 */
library DAOCallerHelper {

    function reputationMint(DAO _dao, address _beneficiary, uint256 _amount) internal {
        bool success;
        (success, ) = _dao.genericCall(
        "Reputation",
        abi.encodeWithSignature("mint(address,uint256)", _beneficiary, _amount),
        0
        );
        require(success, "mint reputation should succeed");
    }

    function reputationBurn(DAO _dao, address _beneficiary, uint256 _amount) internal {
        bool success;
        (success, ) = _dao.genericCall(
        "Reputation",
        abi.encodeWithSignature("burn(address,uint256)", _beneficiary, _amount),
        0
        );
        require(success, "burn reputation should succeed");
    }

    function externalTokenTransfer(DAO _dao, address _stakingToken, address _beneficiary, uint256 _amount) internal {
        bool success;
        (success, ) = _dao.genericCall(
        toString(_stakingToken),
        abi.encodeWithSignature("transfer(address,uint256)", _beneficiary, _amount),
        0
        );
        require(success, "transfer token should succeed");
    }

    function nativeReputation(DAO _dao) internal returns(address) {
        _dao.assetsConstraintRegistery.getAssetAddress("Reputation");
    }

    function toString(address x) private returns (string memory) {
        bytes memory b = new bytes(20);
        for (uint i = 0; i < 20; i++)
            b[i] = byte(uint8(uint(x) / (2**(8*(19 - i)))));
        return string(b);
    }

}
