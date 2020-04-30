pragma solidity ^0.5.17;

import "../controller/Avatar.sol";
import "@daostack/infra-experimental/contracts/votingMachines/IntVoteInterface.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";


contract ArcScheme is Initializable {
    Avatar public avatar;
    IntVoteInterface public votingMachine;
    bytes32 public voteParamsHash;

    /**
     * @dev _initialize
     * @param _avatar the scheme avatar
     * @param _votingMachine the scheme voting machine
     * @param _voteParamsHash the scheme vote params
     */
    function _initialize(Avatar _avatar, IntVoteInterface _votingMachine, bytes32 _voteParamsHash) internal initializer
    {
        require(address(_avatar) != address(0), "Scheme must have avatar");
        avatar = _avatar;
        votingMachine = _votingMachine;
        voteParamsHash = _voteParamsHash;
    }
}
