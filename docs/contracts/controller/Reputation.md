## Reputation


A *Reputation* is a way of assigning importance to participants and their votes.
*Reputation* is similar to regular tokens but with one crucial difference: **It is non-transferable**.

The Reputation contract maintain a map of address to reputation value.
It provides a function to mint ,negative or positive, reputation for a specific address.

### Range

Max reputation allowed is capped by INT256_MAX = 2**255 - Any value minted over this MAX will be cause a revert.

Min reputation allowed is 0. - Any value minted below this MIN will be trim to 0.


 
