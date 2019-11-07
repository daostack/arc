pragma solidity ^0.5.11;

import "@daostack/infra/contracts/Reputation.sol";
import "../controller/DAOToken.sol";
import "../controller/Avatar.sol";
import "../controller/ControllerInterface.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title An on-chain "source of truth" for what DAOs
 *        should be index into DAOstack's subgraph.
 */
contract DAOTracker is Ownable {

    // `blacklist` the DAO from the subgraph's cache.
    // Only able to be set by the owner of the DAOTracker.
    mapping(address=>bool) public blacklisted;

    event TrackDAO(
        address indexed _avatar,
        address _controller,
        address _reputation,
        address _daoToken,
        address _sender,
        string _arcVersion
    );

    event BlacklistDAO(
        address indexed _avatar,
        string _explanationHash
    );

    event ResetDAO(
        address indexed _avatar,
        string _explanationHash
    );

    modifier onlyAvatarOwner(Avatar avatar) {
        require(avatar.owner() == msg.sender,
                "The caller must be the owner of the Avatar.");
        _;
    }

    modifier notBlacklisted(Avatar avatar) {
        require(blacklisted[address(avatar)] == false,
                "The avatar has been blacklisted.");
        _;
    }

    /**
    * @dev track a new organization. This function will tell the subgraph
    *      to start ingesting events from the DAO's contracts.
    *      NOTE: This function should be called as early as possible in the DAO deployment
    *      process. **Smart Contract Events that are emitted from blocks prior to this function's
    *      event being emitted WILL NOT be ingested into the subgraph**, leading to an incorrect
    *      cache. If this happens to you, please contact the subgraph maintainer. Your DAO will
    *      need to be added to the subgraph's startup config, and the cache will need to be rebuilt.
    * @param _avatar the organization avatar
    * @param _controller the organization controller
    */
    function track(Avatar _avatar, ControllerInterface _controller, string memory _arcVersion)
    public
    onlyAvatarOwner(_avatar)
    notBlacklisted(_avatar) {
        // Only allow the information to be set once. In the case of a controller upgrades,
        // the subgraph will be updated via the UpgradeController event.
        require(_avatar != Avatar(0));
        require(_controller != ControllerInterface(0));

        emit TrackDAO(
            address(_avatar),
            address(_controller),
            address(_avatar.nativeReputation()),
            address(_avatar.nativeToken()),
            msg.sender,
            _arcVersion
        );
    }

    /**
    * @dev blacklist a DAO from the cache. This should be callable by maintainer of the cache.
    *      Blacklisting can be used to defend against DoS attacks, or to remove spam. In order
    *      for this blacklisting to take affect within the cache, it would need to be rebuilt.
    * @param _avatar the organization avatar
    * @param _explanationHash A hash of a document explaining why this DAO was blacklisted
    */
    function blacklist(Avatar _avatar, string memory _explanationHash)
    public
    onlyOwner {
        require(_avatar != Avatar(0));
        blacklisted[address(_avatar)] = true;
        emit BlacklistDAO(address(_avatar), _explanationHash);
    }

    /**
    * @dev reset a DAO in the cache. This should be callable by the maintainer of the cache.
    * @param _avatar the organization avatar
    * @param _explanationHash A hash of a document explaining why this DAO was reset
    */
    function reset(Avatar _avatar, string memory _explanationHash)
    public
    onlyOwner {
        require(_avatar != Avatar(0));
        blacklisted[address(_avatar)] = false;
        emit ResetDAO(address(_avatar), _explanationHash);
    }
}
