pragma solidity 0.5.17;
pragma experimental ABIEncoderV2;

import "@daostack/infra/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "../votingMachines/VotingMachineCallbacks.sol";


/**
 * @title WalletScheme.
 * @dev  A scheme for proposing and executing calls to any contract except itself and controller
 */
contract WalletScheme is VotingMachineCallbacks, ProposalExecuteInterface {
    event NewCallProposal(
        address[] _to,
        bytes32 indexed _proposalId,
        bytes[]   _callData,
        uint256[] _value,
        string  _descriptionHash
    );

    event ProposalExecuted(
        bytes32 indexed _proposalId,
        bytes[] _genericCallReturnValue
    );

    event ProposalExecutedByVotingMachine(
        bytes32 indexed _proposalId,
        int256 _param
    );

    event ProposalDeleted(bytes32 indexed _proposalId);

    // Details of a voting proposal:
    struct CallProposal {
        address[] to;
        bytes[] callData;
        uint256[] value;
        bool exist;
        bool passed;
    }

    mapping(bytes32=>CallProposal) public organizationProposals;

    IntVoteInterface public votingMachine;
    bytes32 public voteParams;
    Avatar public avatar;
    address public controller;

    /**
     * @dev initialize
     * @param _avatar the avatar address
     * @param _controller the controller address
     * @param _votingMachine the voting machines address to
     * @param _voteParams voting machine parameters.
     */
    function initialize(
        Avatar _avatar,
        address _controller,
        IntVoteInterface _votingMachine,
        bytes32 _voteParams
    )
    external
    {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");
        require(_controller != address(0), "controller cannot be zero");
        avatar = _avatar;
        controller = _controller;
        votingMachine = _votingMachine;
        voteParams = _voteParams;
    }
    
    /**
    * @dev Fallback function that allows the wallet to receive ETH
    */
    function() external payable {}

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _decision a parameter of the voting result, 1 yes and 2 is no.
    * @return bool success
    */
    function executeProposal(bytes32 _proposalId, int256 _decision)
    external
    onlyVotingMachine(_proposalId)
    returns(bool) {
        CallProposal storage proposal = organizationProposals[_proposalId];
        require(proposal.exist, "must be a live proposal");
        require(proposal.passed == false, "cannot execute twice");

        if (_decision == 1) {
            proposal.passed = true;
            execute(_proposalId);
        } else {
            delete organizationProposals[_proposalId];
            emit ProposalDeleted(_proposalId);
        }

        emit ProposalExecutedByVotingMachine(_proposalId, _decision);
        return true;
    }

    /**
    * @dev execution of proposals after it has been decided by the voting machine
    * @param _proposalId the ID of the voting in the voting machine
    */
    function execute(bytes32 _proposalId) public {
        CallProposal storage proposal = organizationProposals[_proposalId];
        require(proposal.exist, "must be a live proposal");
        require(proposal.passed, "proposal must passed by voting machine");
        proposal.exist = false;
        bytes[] memory genericCallReturnValues = new bytes[](proposal.to.length);
        bytes memory genericCallReturnValue;
        bool success;
        for(uint i = 0; i < proposal.to.length; i ++) {
          (success, genericCallReturnValue) =
          address(proposal.to[i]).call.value(proposal.value[i])(proposal.callData[i]);
          genericCallReturnValues[i] = genericCallReturnValue;
        }
        if (success) {
            delete organizationProposals[_proposalId];
            emit ProposalDeleted(_proposalId);
            emit ProposalExecuted(_proposalId, genericCallReturnValues);
        } else {
            proposal.exist = true;
        }
    }

    /**
    * @dev propose to call an address
    *      The function trigger NewCallProposal event
    * @param _to - The addresses to call
    * @param _callData - The abi encode data for the calls
    * @param _value value(ETH) to transfer with the calls
    * @param _descriptionHash proposal description hash
    * @return an id which represents the proposal
    */
    function proposeCalls(address[] memory _to, bytes[] memory _callData, uint256[] memory _value, string memory _descriptionHash)
    public
    returns(bytes32)
    {
        for(uint i = 0; i < _to.length; i ++) {
          require(_to[i] != controller && _to[i] != address(this), 'invalid proposal caller');
        }
        require(_to.length == _callData.length, 'invalid callData length');
        require(_to.length == _value.length, 'invalid _value length');
        
        bytes32 proposalId = votingMachine.propose(2, voteParams, msg.sender, _to[0]);

        organizationProposals[proposalId] = CallProposal({
            to: _to,
            callData: _callData,
            value: _value,
            exist: true,
            passed: false
        });
        proposalsInfo[address(votingMachine)][proposalId] = ProposalInfo({
            blockNumber: block.number,
            avatar: avatar
        });
        emit NewCallProposal(_to, proposalId, _callData, _value, _descriptionHash);
        return proposalId;
    }
    
    function getOrganizationProposal(bytes32 proposalId) public view 
      returns (address[] memory to, bytes[] memory callData, uint256[] memory value, bool exist, bool passed)
    {
      return (
        organizationProposals[proposalId].to,
        organizationProposals[proposalId].callData,
        organizationProposals[proposalId].value,
        organizationProposals[proposalId].exist,
        organizationProposals[proposalId].passed
      );
    }

}
