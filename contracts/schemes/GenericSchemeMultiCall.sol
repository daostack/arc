pragma solidity 0.5.17;

import "@daostack/infra/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra/contracts/votingMachines/ProposalExecuteInterface.sol";
import "../votingMachines/VotingMachineCallbacks.sol";
import "../libs/BytesLib.sol";


/**
 * @title GenericSchemeMultiCall.
 * @dev  A scheme for proposing and executing calls to multiple arbitrary function
 * on one or multiple contracts on behalf of the organization avatar.
 */
contract GenericSchemeMultiCall is VotingMachineCallbacks, ProposalExecuteInterface {
    using BytesLib for bytes;
    using SafeMath for uint256;

    // Details of a voting proposal:
    struct MultiCallProposal {
        address[] contractsToCall;
        bytes callsData;
        uint256[] callsDataLens;
        uint256[] values;
        bool exist;
        bool passed;
    }

    mapping(bytes32=>MultiCallProposal) public proposals;

    IntVoteInterface public votingMachine;
    bytes32 public voteParams;
    mapping(address=>bool) internal contractWhitelist;
    address[] public whitelistedContracts;
    Avatar public avatar;

    event NewMultiCallProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        bytes   _callsData,
        uint256[] _values,
        string  _descriptionHash,
        address[] _contractsToCall
    );

    event ProposalExecuted(
        address indexed _avatar,
        bytes32 indexed _proposalId
    );

    event ProposalCallExecuted(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address _contractToCall,
        bytes _callsData,
        bytes _callDataReturnValue
    );

    event ProposalExecutedByVotingMachine(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        int256 _param
    );

    event ProposalDeleted(address indexed _avatar, bytes32 indexed _proposalId);

    /**
     * @dev initialize
     * @param _avatar the avatar to mint reputation from
     * @param _votingMachine the voting machines address to
     * @param _voteParams voting machine parameters.
     * @param _contractWhitelist the contracts the scheme is allowed to interact with
     *
     */
    function initialize(
        Avatar _avatar,
        IntVoteInterface _votingMachine,
        bytes32 _voteParams,
        address[] calldata _contractWhitelist
    )
    external
    {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");
        require(_contractWhitelist.length > 0, "contractWhitelist cannot be empty");
        avatar = _avatar;
        votingMachine = _votingMachine;
        voteParams = _voteParams;
        /* Whitelist controller by default*/
        Controller controller = Controller(_avatar.owner());
        whitelistedContracts.push(address(controller));
        contractWhitelist[address(controller)] = true;

        for (uint i = 0; i < _contractWhitelist.length; i++) {
            contractWhitelist[_contractWhitelist[i]] = true;
            whitelistedContracts.push(_contractWhitelist[i]);
        }
    }

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
        MultiCallProposal storage proposal = proposals[_proposalId];
        require(proposal.exist, "must be a live proposal");
        require(!proposal.passed, "cannot execute twice");

        if (_decision == 1) {
            proposal.passed = true;
        } else {
            delete proposals[_proposalId];
            emit ProposalDeleted(address(avatar), _proposalId);
        }

        emit ProposalExecutedByVotingMachine(address(avatar), _proposalId, _decision);
        return true;
    }

    /**
    * @dev execution of proposals after it has been decided by the voting machine
    * @param _proposalId the ID of the voting in the voting machine
    */
    function execute(bytes32 _proposalId) external {
        MultiCallProposal storage proposal = proposals[_proposalId];
        require(proposal.exist, "must be a live proposal");
        require(proposal.passed, "proposal must passed by voting machine");
        proposal.exist = false;
        bytes memory genericCallReturnValue;
        bool success;
        Controller controller = Controller(whitelistedContracts[0]);
        uint256 startIndex = 0;

        for (uint i = 0; i < proposal.contractsToCall.length; i++) {
            bytes memory callData = proposal.callsData.slice(startIndex, proposal.callsDataLens[i]);
            if (proposal.contractsToCall[i] == address(controller)) {
                (IERC20 extToken,
                address spender,
                uint256 valueToSpend
                ) =
                abi.decode(
                    callData,
                    (IERC20, address, uint256)
                );
                success = controller.externalTokenApproval(extToken, spender, valueToSpend, avatar);
            } else {
                (success, genericCallReturnValue) =
                controller.genericCall(proposal.contractsToCall[i], callData, avatar, proposal.values[i]);
            }

            /* Whole transaction will be reverted if at least one call fails*/
            require(success, "Proposal call failed");
            startIndex = startIndex.add(proposal.callsDataLens[i]);
            emit ProposalCallExecuted(
                address(avatar),
                _proposalId,
                proposal.contractsToCall[i],
                callData,
                genericCallReturnValue
            );
        }

        delete proposals[_proposalId];
        emit ProposalDeleted(address(avatar), _proposalId);
        emit ProposalExecuted(address(avatar), _proposalId);
    }

    /**
    * @dev propose to call one or multiple contracts on behalf of the _avatar
    *      The function trigger NewMultiCallProposal event
    * @param _contractsToCall the contracts to be called
    * @param _callsData - The abi encode data for the calls
    * @param _callsDataLens the length of each callData
    * @param _values value(ETH) to transfer with the calls
    * @param _descriptionHash proposal description hash
    * @return an id which represents the proposal
    */
    function proposeCalls(
        address[] memory _contractsToCall,
        bytes memory _callsData,
        uint256[] memory _callsDataLens,
        uint256[] memory _values,
        string memory _descriptionHash
    )
    public
    returns(bytes32 proposalId)
    {
        require(
            (_contractsToCall.length == _callsDataLens.length) && (_contractsToCall.length == _values.length),
            "Wrong length of _contractsToCall, _callsDataLens or _values arrays"
        );
        uint256 startIndex = 0;
        for (uint i = 0; i < _contractsToCall.length; i++) {
            require(
                contractWhitelist[_contractsToCall[i]], "contractToCall is not whitelisted"
            );
            bytes memory callData = _callsData.slice(startIndex, _callsDataLens[i]);
            if (_contractsToCall[i] == whitelistedContracts[0]) {

                (, address spender,) =
                abi.decode(
                    callData,
                    (IERC20, address, uint256)
                );
                require(contractWhitelist[spender], "spender contract not whitelisted");
            }
            startIndex = startIndex.add(_callsDataLens[i]);
        }
        require(startIndex == _callsData.length, "_callsDataLens is wrong");

        proposalId = votingMachine.propose(2, voteParams, msg.sender, address(avatar));

        proposals[proposalId] = MultiCallProposal({
            contractsToCall: _contractsToCall,
            callsData: _callsData,
            callsDataLens: _callsDataLens,
            values: _values,
            exist: true,
            passed: false
        });
        proposalsInfo[address(votingMachine)][proposalId] = ProposalInfo({
            blockNumber:block.number,
            avatar:avatar
        });

        emit NewMultiCallProposal(address(avatar), proposalId, _callsData, _values, _descriptionHash, _contractsToCall);
    }
}
