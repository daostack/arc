pragma solidity 0.5.15;
import "../dao/DAO.sol";


/**
 * @title reputation allocation contract
 * This scheme can be used to allocate a pre define amount of reputation to whitelisted
 * beneficiaries.
 * this contract can be used as the rep mapping contract for  RepitationFromToken contract.
 */
library DAOCallerHelper {

    function reputationMint(DAO _dao, address _beneficiary, uint256 _amount) internal returns(bool success) {
        (success, ) = _dao.genericCall(
        "Reputation",
        abi.encodeWithSignature("mint(address,uint256)", _beneficiary, _amount),
        0
        );
        require(success, "mint reputation should succeed");
    }

    function reputationBurn(DAO _dao, address _beneficiary, uint256 _amount) internal returns(bool success) {
        (success, ) = _dao.genericCall(
        "Reputation",
        abi.encodeWithSignature("burn(address,uint256)", _beneficiary, _amount),
        0
        );
        require(success, "burn reputation should succeed");
    }

    function nativeTokenMint(DAO _dao, address _beneficiary, uint256 _amount) internal {
        bool success;
        (success, ) = _dao.genericCall(
        "NativeToken",
        abi.encodeWithSignature("mint(address,uint256)", _beneficiary, _amount),
        0
        );
        require(success, "mint token should succeed");
    }

    function externalTokenTransfer(DAO _dao, address _stakingToken, address _beneficiary, uint256 _amount)
    internal
    returns(bool success) {
        (success, ) = _dao.genericCall(
        toString(_stakingToken),
        abi.encodeWithSignature("transfer(address,uint256)", _beneficiary, _amount),
        0
        );
        require(success, "transfer token should succeed");
    }

    function sendEther(DAO _dao, address payable _to, uint256 _amount) internal {
        bool success;
        (success, ) = _dao.genericCall(
        "Wallet",
        abi.encodeWithSignature("sendEther(address,uint256)", _to, _amount),
        0
        );
        require(success, "send Ether should succeed");
    }

    function registerActor(DAO _dao, address _actor) internal {
        bool success;
        (success, ) = _dao.genericCall(
        "ActorsRegistry",
        abi.encodeWithSignature("register(address)", _actor),
        0
        );
        require(success, "ActorsRegistry register actor should succeed");
    }

    function unRegisterActor(DAO _dao, address _actor) internal {
        bool success;
        (success, ) = _dao.genericCall(
        "ActorsRegistry",
        abi.encodeWithSignature("unRegister(address)", _actor),
        0
        );
        require(success, "ActorsRegistry unRegister actor should succeed");
    }

    function upgradeDAO(DAO _dao, address _newImplementation) internal {
        bool success;
        (success, ) = _dao.genericCall(
        "SELF",
        abi.encodeWithSignature("upgradeTo(address)", _newImplementation),
        0
        );
        require(success, "upgradeDAO should succeed");
    }

    function genericCall(DAO _dao,
                        address _contractToCall,
                        bytes memory _data,
                        uint256 _value)
    internal
    returns(bool success, bytes memory returnValue) {
        (success, returnValue) = _dao.genericCall(
        toString(_contractToCall),
        _data,
        _value
        );
    }

    function nativeReputation(DAO _dao) internal view returns(address) {
        _dao.assetsRegistery().getAssetAddress("Reputation");
    }

    function toString(address x) private returns (string memory) {
        bytes memory b = new bytes(20);
        for (uint i = 0; i < 20; i++)
            b[i] = byte(uint8(uint(x) / (2**(8*(19 - i)))));
        return string(b);
    }

}
