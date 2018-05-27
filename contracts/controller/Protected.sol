pragma solidity ^0.4.21;

/**
 * @title Base class for contracts which deal with fine-grained permissions to their operations.
 * @dev The `Protected` base class manages a set of locks for each resourse/operation and a set of keys for each address.
 *      keys can be created, transfered, used, and expired.
 *      Use the `lock(..)` function to create a new lock.
 *      Use the `locked(..)` modifier to lock a resource/operation with a lock.
 */
contract Protected {
    struct Key {
        bool exists;
        bool transferable;
        uint expiration; // zero = no expiration
        uint uses; // zero = infinite uses
    }

    //      id                 owner      key
    mapping(bytes32 => mapping(address => Key)) public keys;

    event Lock(bytes32 indexed id);
    event Transfer(bytes32 indexed id, address indexed from, address indexed to, bool transferable, uint expiration, uint uses);
    event Use(bytes32 indexed id, address indexed owner);
    event Revoke(bytes32 indexed id, address indexed owner);

    /**
     * @dev Create a new key for a new lock. The owner of the key is the contract itself.
     * @param id unique lock id
     * @param expiration key can be used only before expiration time.
     * @param uses key can be used only #uses times.
     */
    function lock(
        bytes32 id
    ) internal {
        require(!keys[id][this].exists);

        keys[id][this].exists = true;
        keys[id][this].transferable = true;
        keys[id][this].expiration = 0;
        keys[id][this].uses = 0;

        emit Lock(id);
    }

    /**
     * @dev Destroy a given key making it non existent.
     * @param id lock id,
     * @param owner the owner of the key.
     */
    function revoke(bytes32 id, address owner) internal {
        keys[id][owner].exists = false;
        emit Revoke(id, owner);
    }

    /**
     * @dev Destroy the sender's key.
     * @param id lock id,
     */
    function revoke(bytes32 id) public {
        revoke(id, msg.sender);
    }

    /**
     * @dev Transfer part of the capabilities of the owner to another account.
     * @notice if the next owner already has a key for this lock id, the keys will be merged into a single key.
     * @param id lock id.
     * @param from current owner.
     * @param to next owner.
     * @param transferable can the next owner transfer the key onwards to another account.
     * @param expiration can only be lower than current expiration.
     * @param uses can only be smaller than current uses.
     */
    function transferKeyFrom(
        bytes32 id,
        address from,
        address to,
        bool transferable,
        uint expiration,
        uint uses
    ) internal {
        Key memory key = keys[id][from];
        require(key.exists);
        require(key.transferable);
        require(expiration != 0 || key.expiration == 0);
        require(expiration <= key.expiration);
        require(uses != 0 || key.uses == 0);
        require(uses <= key.uses);

        if (uses > 0 && uses == key.uses) {
            keys[id][from].exists = false;
        } else {
            keys[id][from].uses -= uses;
        }

        if(keys[id][to].exists) {
            // Merge capabilities (note: this can be a problem since it might expand capabilities)
            keys[id][to].transferable = transferable;
            keys[id][to].expiration = max(expiration, keys[id][to].expiration);
            keys[id][to].uses += uses;
        } else {
            keys[id][to].exists = true;
            keys[id][to].transferable = transferable;
            keys[id][to].expiration = expiration;
            keys[id][to].uses = uses;
        }

        emit Transfer(id, from, to, transferable, expiration, uses);
    }

    /**
     * @dev Transfer part of the capabilities of the sender to another account.
     * @notice if the next owner already has a key for this lock id, the keys will be merged into a single key.
     * @param id lock id.
     * @param to next owner.
     * @param transferable can the next owner transfer the key onwards to another account.
     * @param expiration can only be lower than current expiration.
     * @param uses can only be smaller than current uses.
     */
    function transferKey(
        bytes32 id,
        address to,
        bool transferable,
        uint expiration,
        uint uses
    ) public {
        transferKeyFrom(
            id,
            msg.sender,
            to,
            transferable,
            expiration,
            uses
        );
    }

    /**
     * @dev Transfer all of the capabilities of the owner to another account.
     * @notice if the next owner already has a key for this lock id, the keys will be merged into a single key.
     * @param id lock id.
     * @param from current owner.
     * @param to next owner.
     */
    function transferAllFrom(bytes32 id, address from, address to) internal {
        Key memory key = keys[id][from];
        transferKeyFrom(id, from, to, true, key.expiration, key.uses);
    }

    /**
     * @dev Transfer all of the capabilities of the sender to another account.
     * @notice if the next owner already has a key for this lock id, the keys will be merged into a single key.
     * @param id lock id.
     * @param to next owner.
     */
    function transferAll(bytes32 id, address to) public {
        transferAllFrom(id, msg.sender, to);
    }

    /**
     * @dev A modifier that locks a function with a lock id.
     * @notice The key of the sender is used everytime this is called.
     * @param id lock id.
     */
    modifier locked(bytes32 id) {
        Key memory key = keys[id][msg.sender];
        require(key.exists);
        require(key.expiration == 0 || key.expiration >= now);

        if (key.uses == 1) {
            keys[id][msg.sender].exists = false;
        } else if (key.uses > 1){
            keys[id][msg.sender].uses --;
        }

        emit Use(id, msg.sender);

        _;
    }


    // utils
    function max(uint a, uint b) private pure returns(uint) {
        if(a > b) {
            return a;
        } else {
            return b;
        }
    }
}


/**
 * @title a simple example of how to use the Protected base class.
 */
contract ProtectedController is Protected {
    uint schemesRegistered = 0;
    mapping(uint => uint) public schemes;

    function ProtectedController() public {
        lock("RegisterScheme");
        /*
            The sender has *2 days from now* to register *up to 10* schemes, he *can transfer* this capability to other accounts
        */
        transferKeyFrom("RegisterScheme", this, msg.sender, true, now + 2 days, 10);
    }

    function registerScheme() locked("RegisterScheme") public {
        schemes[schemesRegistered] = 0;

        /*
            Once registered, *only* the original registerer can set the scheme params *once* *within 4 days*.
        */
        lock(keccak256("setParam", schemesRegistered));
        transferKeyFrom(keccak256("setParam", schemesRegistered), this, msg.sender, false, now + 4 days, 1);

        schemesRegistered++;
    }

    function setParam(uint scheme, uint param) locked(keccak256("setParam", scheme)) public {
        schemes[scheme] = param;
    }
}
