pragma solidity ^0.5.17;

import "@daostack/infra-experimental/contracts/votingMachines/GenesisProtocol.sol";
import "@daostack/infra-experimental/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "@daostack/infra-experimental/contracts/votingMachines/ProposalExecuteInterface.sol";
import "@daostack/infra-experimental/contracts/Reputation.sol";
import "../controller/Avatar.sol";
import "../controller/Controller.sol";

contract ArcVotableSchemeMock is VotingMachineCallbacksInterface, ProposalExecuteInterface, GenesisProtocol {

    Avatar public avatar;
    Reputation public reputation;
    IERC20 public stakingToken;
    mapping (bytes32=>uint) public proposalsBlockNumbers;
    uint256 public testData;

    event NewProposal(
        bytes32 indexed _proposalId,
        address indexed _organization,
        uint256 _numOfChoices,
        address _proposer
    );

    /**
    * @dev initialize
    */
    function initialize(
        Avatar _avatar,
        Reputation _reputation,
        IERC20 _stakingToken,
        uint[11] calldata _params,
        address _voteOnBehalf,
        address _authorizedToPropose,
        uint256 _testData
    )
    external {
        avatar = _avatar;
        GenesisProtocolLogic.initialize(
            _stakingToken,
            _params,
            _voteOnBehalf,
            address(_avatar),
            address(this),
            _authorizedToPropose
        );
        reputation = _reputation;
        stakingToken = _stakingToken;
        testData = _testData;
    }

    function proposeTest(uint256 _numOfChoices, address _proposer)
    external
    returns
    (bytes32)
    {
        bytes32 proposalId = GenesisProtocolLogic.propose(_numOfChoices, _proposer);
        emit NewProposal(proposalId, address(this), _numOfChoices, _proposer);
        proposalsBlockNumbers[proposalId] = block.number;

        return proposalId;
    }

    //this function is used only for testing purpose on this mock contract
    function burnReputationTest(uint256 _amount, address _beneficiary, bytes32)
    external
    returns(bool)
    {
        return reputation.burn(_beneficiary, _amount);
    }

    function setProposal(bytes32 _proposalId) external returns(bool) {
        proposalsBlockNumbers[_proposalId] = block.number;
    }

    function executeProposal(bytes32 _proposalId, int _decision) external returns(bool) {
        return true;
    }

    function mintReputation(uint256 _amount, address _beneficiary, bytes32)
    public
    returns(bool)
    {
        require(msg.sender == address(this), "Only the scheme can call this method");
        return reputation.mint(_beneficiary, _amount);
    }

    function burnReputation(uint256 _amount, address _beneficiary, bytes32)
    public
    returns(bool)
    {
        require(msg.sender == address(this), "Only the scheme can call this method");
        return reputation.burn(_beneficiary, _amount);
    }

    function stakingTokenTransfer(IERC20 _stakingToken, address _beneficiary, uint256 _amount, bytes32)
    public
    returns(bool)
    {
        require(msg.sender == address(this), "Only the scheme can call this method");
        return _stakingToken.transfer(_beneficiary, _amount);
    }

    function getTotalReputationSupply(bytes32 _proposalId) public view returns(uint256) {
        return reputation.totalSupplyAt(proposalsBlockNumbers[_proposalId]);
    }

    function balanceOfStakingToken(IERC20 _stakingToken, bytes32)
    public
    view
    returns(uint256)
    {
        return _stakingToken.balanceOf(address(this));
    }

    function reputationOf(address _owner, bytes32 _proposalId) public view returns(uint256) {
        return reputation.balanceOfAt(_owner, proposalsBlockNumbers[_proposalId]);
    }

    function genericCall(Avatar _avatar, address _contract, uint256 _a, address _b, bytes32 _c, uint256 _value)
    public returns(bool, bytes memory)
    {

        address controller = _avatar.owner();
        return Controller(controller).genericCall(
        _contract, abi.encodeWithSignature("test(uint256,address,bytes32)", _a, _b, _c), _value);
    }

    function genericCallDirect(Avatar _avatar, address _contract, uint256 _a, address _b, bytes32 _c, uint256 _value)
    public returns(bool, bytes memory)
    {
        return _avatar.genericCall(
        _contract,
        abi.encodeWithSignature("test(uint256,address,bytes32)", _a, _b, _c),
        _value);
    }
}
