# Reputation
[see the generated documentation](../../generated_docs/controller/Reputation.md)

A DAO has Reputation System which allows peers to rate other peers in order to build trust . A reputation is use to assign influence measure to a DAO'S peers.
For example : A DAO might choose to use a reputation based voting mechanism in order to take decisions. In this case a peer with relatively higher reputation value will have more influence in the organization.
*Reputation* is similar to regular tokens but with one crucial difference: **It is non-transferable**.

The Reputation contract maintain a map of address to reputation value.
It provides a function to mint ,negative or positive, reputation for a specific address.

### Range
               
Max reputation allowed is capped by INT256_MAX = 2**255 - Any value minted over this MAX will cause a revert.

Min reputation allowed is 0. - Any value minted below this MIN will be trim to 0.
