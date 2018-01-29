pragma solidity ^0.4.4

import "./Ownable"
import "./Mortal"
import "./Token"
import "./Reputation"

/* ************** */

contract TokenPrinter is Token, Ownable {
...

  function mintToken () {
    ...
  }

}

/* ************** */

contract ReputationPrinter is Reputation, Ownable {
...
  function mintReputation () {
    ...
  }
}

/* ************** */


contract approvalToken () {
  /* token that can be minted and send to contracts that are approved for something */
}

/* ************** */

contract Master is Mortal, approvalToken {
...

  function Master () {
  ...
  /* Constructor deploys TokenPrinter and ReputationPrinter, and become their owner */
  }

  /* for Value-System upgrade simply create a new Master contract, send Token&Reputation ownership to new Master and kill old Master */

  function sendTokenOwnership () {
    ...
  }

  function sentReputationOwnership () {
    ...
  }


  function sendOwnership () {
    sendTokenOwnership ()
    sendReputationOwnership ()
    selfdestruct ()
  }



  function printToken () {
    /* call Token.mintToken  */
  }

  function printReputation () {
    /* call Reputation.mintReputation  */
  }

  function kill () {
     /* selfdestruct */
  }

  function approveProposal (address approved_) {
    /* mint and send approvalToken to approved_ address */
  }

}

/* ************** */
