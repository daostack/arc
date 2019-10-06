pragma solidity ^0.5.11;

import "../controller/ControllerInterface.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "./CurveInterface.sol";
import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @title A scheme for reputation allocation according to token balances
 *        This contract is assuming that the token contract is paused, and one cannot transfer its tokens.
 */

contract ReputationFromToken {
    using ECDSA for bytes32;
    using SafeMath for uint256;

    IERC20 public tokenContract;
    CurveInterface public curve;
    //      beneficiary -> bool
    mapping(address     => bool) public redeems;
    Avatar public avatar;

    // Digest describing the data the user signs according EIP 712.
    // Needs to match what is passed to Metamask.
    bytes32 public constant DELEGATION_HASH_EIP712 =
    keccak256(abi.encodePacked(
    "address ReputationFromTokenAddress",
    "address Beneficiary"
    ));

    event Redeem(address indexed _beneficiary, address indexed _sender, uint256 _amount);
    
    /**
     * @dev initialize
     * @param _avatar the avatar to mint reputation from
     * @param _tokenContract the token contract
     */
    function initialize(Avatar _avatar, IERC20 _tokenContract, CurveInterface _curve) external
    {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");
        tokenContract = _tokenContract;
        avatar = _avatar;
        curve = _curve;
    }

    /**
     * @dev redeem function
     * @param _beneficiary the beneficiary address to redeem for
     * @return uint256 minted reputation
     */
    function redeem(address _beneficiary) external returns(uint256) {
        return _redeem(_beneficiary, msg.sender);
    }

    /**
     * @dev redeemWithSignature function
     * @param _beneficiary the beneficiary address to redeem for
     * @param _signatureType signature type
              1 - for web3.eth.sign
              2 - for eth_signTypedData according to EIP #712.
     * @param _signature  - signed data by the staker
     * @return uint256 minted reputation
     */
    function redeemWithSignature(
        address _beneficiary,
        uint256 _signatureType,
        bytes calldata _signature
        )
        external
        returns(uint256)
        {
        // Recreate the digest the user signed
        bytes32 delegationDigest;
        if (_signatureType == 2) {
            delegationDigest = keccak256(
                abi.encodePacked(
                    DELEGATION_HASH_EIP712, keccak256(
                        abi.encodePacked(
                        address(this),
                        _beneficiary)
                    )
                )
            );
        } else {
            delegationDigest = keccak256(
                        abi.encodePacked(
                        address(this),
                        _beneficiary)
                    ).toEthSignedMessageHash();
        }
        address redeemer = delegationDigest.recover(_signature);
        require(redeemer != address(0), "redeemer address cannot be 0");
        return _redeem(_beneficiary, redeemer);
    }

    /**
     * @dev redeem function
     * @param _beneficiary the beneficiary address to redeem for
     * @param _redeemer the redeemer address
     * @return uint256 minted reputation
     */
    function _redeem(address _beneficiary, address _redeemer) private returns(uint256) {
        require(avatar != Avatar(0), "should initialize first");
        require(redeems[_redeemer] == false, "redeeming twice from the same account is not allowed");
        redeems[_redeemer] = true;
        uint256 tokenAmount = tokenContract.balanceOf(_redeemer);
        if (curve != CurveInterface(0)) {
            tokenAmount = curve.calc(tokenAmount);
        }
        if (_beneficiary == address(0)) {
            _beneficiary = _redeemer;
        }
        require(
        ControllerInterface(
        avatar.owner())
        .mintReputation(tokenAmount, _beneficiary, address(avatar)), "mint reputation should succeed");
        emit Redeem(_beneficiary, _redeemer, tokenAmount);
        return tokenAmount;
    }
}
