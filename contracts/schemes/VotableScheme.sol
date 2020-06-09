pragma solidity ^0.5.17;

import "../controller/Avatar.sol";
import "../controller/Controller.sol";
import "@daostack/infra-experimental/contracts/votingMachines/GenesisProtocol.sol";
import "@daostack/infra-experimental/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "@daostack/infra-experimental/contracts/votingMachines/ProposalExecuteInterface.sol";

contract VotableScheme is VotingMachineCallbacksInterface, GenesisProtocol {
    Avatar public avatar;

    modifier onlySelf() {
        require(msg.sender == address(this), "Only the scheme can call this method");
        _;
    }

    /**
    * @dev _initialize
    * @param _avatar the scheme avatar
    * @param _stakingToken (for GenesisProtocol)
    * @param _votingParams genesisProtocol parameters - valid only if _voteParamsHash is zero
    * @param _voteOnBehalf  parameter
    * @param _authorizedToPropose only this address allow to propose (unless it is zero)
    */
    function _initializeVoting(
        Avatar _avatar,
        IERC20 _stakingToken,
        uint[11] memory _votingParams,
        address _voteOnBehalf,
        address _authorizedToPropose
    ) internal {
        require(address(_avatar) != address(0), "Scheme must have avatar");
        avatar = _avatar;
        GenesisProtocolLogic.initialize(
            _stakingToken,
            _votingParams,
            _voteOnBehalf,
            address(_avatar),
            address(this),
            _authorizedToPropose
        );
    }

    // proposalId  ->  blockNumber
    mapping(bytes32 => uint256) public proposalsBlockNumber;

    // TODO: Remove _proposalId from the interface
    function mintReputation(uint256 _amount, address _beneficiary, bytes32 _proposalId) public onlySelf returns(bool) {
        return Controller(avatar.owner()).mintReputation(_amount, _beneficiary);
    }

    // TODO: Remove _proposalId from the interface
    function burnReputation(uint256 _amount, address _beneficiary, bytes32 _proposalId) public onlySelf returns(bool) {
        return Controller(avatar.owner()).burnReputation(_amount, _beneficiary);
    }

    // TODO: Remove _proposalId from the interface
    function stakingTokenTransfer(
        IERC20 _stakingToken,
        address _beneficiary,
        uint256 _amount,
        bytes32 _proposalId
    ) public onlySelf returns(bool) {
        return Controller(avatar.owner()).externalTokenTransfer(_stakingToken, _beneficiary, _amount);
    }

    // TODO: Remove _proposalId from the interface
    function balanceOfStakingToken(IERC20 _stakingToken, bytes32 _proposalId) public view returns(uint256) {
        return _stakingToken.balanceOf(address(avatar));
    }

    function getTotalReputationSupply(bytes32 _proposalId) public view returns(uint256) {
        return avatar.nativeReputation().totalSupplyAt(proposalsBlockNumber[_proposalId]);
    }

    function reputationOf(address _owner, bytes32 _proposalId) public view returns(uint256) {
        return avatar.nativeReputation().balanceOfAt(_owner, proposalsBlockNumber[_proposalId]);
    }
}
