pragma solidity ^0.4.24;

import "../universalSchemes/UniversalScheme.sol";
import "@daostack/infra/contracts/VotingMachines/GenesisProtocol.sol";


contract GenesisProtocolCallbacks is GenesisProtocolCallbacksInterface {

    Avatar public avatar;
    StandardToken public stakingToken;
    GenesisProtocol public genesisProtocol;

    /**
     * @dev Constructor
     */
    constructor(Avatar _avatar,StandardToken _stakingToken,GenesisProtocol _genesisProtocol) public
    {
        avatar = _avatar;
        stakingToken = _stakingToken;
        genesisProtocol = _genesisProtocol;
    }

    function getTotalReputationSupply(bytes32) external returns(uint256) {
        return avatar.nativeReputation().totalSupply();
    }

    function mintReputation(uint _amount,address _beneficiary,bytes32) external returns(bool) {
        return ControllerInterface(avatar.owner()).mintReputation(_amount,_beneficiary,address(avatar));
    }

    function burnReputation(uint _amount,address _beneficiary,bytes32) external returns(bool) {
        return ControllerInterface(avatar.owner()).burnReputation(_amount,_beneficiary,address(avatar));
    }

    function reputationOf(address _owner,bytes32) external view returns(uint) {
        return avatar.nativeReputation().reputationOf(_owner);
    }

    function stakingTokenTransfer(address _beneficiary,uint _amount,bytes32) external returns(bool) {
        return ControllerInterface(avatar.owner()).externalTokenTransfer(stakingToken,_beneficiary,_amount,address(avatar));
    }

    function setParameters(uint[14] _params,address _voteOnBehalf) external returns(bytes32) {
        return genesisProtocol.setParameters(_params,_voteOnBehalf);
    }

    function executeProposal(bytes32 _proposalId,int _decision,ExecutableInterface _executable) external returns(bool) {
        return  _executable.execute(_proposalId, avatar, _decision);
    }
}
