pragma solidity ^0.4.11;

import "../controller/Controller.sol";

/**
 * @title EmergentICO
 * @dev An ICO scheme following the Emergent whitepaper.
 * Author: Adam Levi.
 * Model Architecture: Matan Field.
 * The ICO is splitted into batches, each batch has its own rate.
 * The rate decrese exponentially, according to a geometric series.
 * The sale is not based on first come first served, rather there are periods.
 * All investors in the same period split get the same rate, and get pro-rata share.
 * To avoid the problem of future missing information, one can determine a final batch.
 * On default send there is no final batch defined.
 * Funds sent with a final batch that get a share smaller so it cannot fill the full donation will receive change.
 * Minting of tokens (clearing the batches) can only be done at the end of the period.
 * The action itself can either be called from the doner, to clear his own donation.
 * The admin can clear donation for everyone.
 */

contract EmergentICO {
  // A struct to hold the details of each batch
  struct Batch {
    uint numOfDonations; // A counter of donations arrived on this batch.
    uint totalForProRata; // The total funds that is the whole from which donators get pro-rata share.
    uint totalFinalBatchDonations; // Holds the total amount of funds that this is their final batch.
    bool isReminderCollected; // A flag to check if pro-rata reminder from previous batch was updated.
  }

  // A struct to hold the details of each donation
  struct Donation {
    address donator; // The address calling (msg.sender).
    address benificiary; // The address for which the tokens will minted for.
    uint value; // Donation value arriving on transaction (msg.value).
    uint finalBatch; // The final batch in which the donator is willing to participate, only if isLimitedBatches is true.
    bool isLimitedBatches; // A flag to indicate one wants to use the final batch feature.
    uint leftToClear; // Amount of funds left to clear from this donation.
    uint startingBatch; // The first batch from which donator gets pro-rata.
    uint clearedBatches; // Number of batches cleared.
  }

  // Events for GUI:
  event LogDonationReceived (address indexed _donator, address indexed _beneficiary, uint _period, uint _value, bool _isLimitedBatches, uint _finalBatch);
  event LogBatchFilled(uint indexed _batch);
  event LogBatchCleared(uint indexed _donationId, uint indexed _batchId, uint _currentShareOfBatch, uint _tokens);
  event LogMintTokens(address indexed _beneficiary, uint _value);

  // Parameters:
  Controller public controller; // The conroller is responsible to mint tokens.
  address public admin; // Admin can halt and resume the ICO, and also clear batches for everyone.
  address public target; // The funds will be tranffered here.
  uint public startBlock; // ICO starting block.
  uint public clearancePeriodDuration; // The length of each clearance period in blocks.
  uint public minDonation;
  // Rate at batch n is initialRate*(rateFractionNumerator/rateFractionDenominator)^n.
  uint public initialRate;
  uint public rateFractionNumerator;
  uint public rateFractionDenominator;
  uint public batchSize; // Each betch size in wei.

  // Variables:
  uint public totalReceived; // Total of funds received in the contract, including the returned change.
  uint public totalDonated; // The total funds actually donated.
  uint public currentBatchId; // Holding the Id of current batch.
  uint public partLeftOfCurrentBatch; // The part left in batch out of the batchSize.
  uint public donationCounter;
  bool public isHalted; // Flag to indicate ICO is halted.


  mapping(uint=>Batch) batches; // A mapping from batchId to the batch struct.
  mapping(uint=>Donation) donations; // A mapping from donationId to the donation struct.
  mapping(uint=>uint) startingBatchOfPeriod; // Mapping from the period to the first batch of the period.

  // Modifier:
  modifier onlyAdmin() {
    require(msg.sender == admin);
    _;
  }


  /**
   * @dev Constructor, setting all the parameters:
   */
  function EmergentICO(
    Controller _controller,
    address _admin,
    address _target,
    uint _startBlock,
    uint _clearancePeriodDuration,
    uint _minDonation,
    uint _initialRate,
    uint _rateFractionNumerator,
    uint _rateFractionDenominator,
    uint _batchSize
    ) {
      // Set parameters:
      controller = _controller;
      admin = _admin;
      target = _target;
      startBlock = _startBlock;
      clearancePeriodDuration = _clearancePeriodDuration;
      minDonation = _minDonation;
      initialRate = _initialRate;
      rateFractionNumerator = _rateFractionNumerator;
      rateFractionDenominator = _rateFractionDenominator;
      batchSize = _batchSize;

      // Initiate variable:
      partLeftOfCurrentBatch = batchSize;
  }

  /**
   * @dev Pausing ICO, using onlyAdmin modifier:
   */
  function haltICO() onlyAdmin {
    isHalted = true;
  }

  /**
   * @dev Resuming ICO, using onlyAdmin modifier:
   */
  function resumeICO() onlyAdmin {
    isHalted = false;
  }

  /**
   * @dev Constant boolean function, checking if the ICO is active:
   */
  function isActive() constant returns(bool) {
    if (isHalted) {
      return false;
    }
    if (block.number >= startBlock) {
      return false;
    }
    return true;
  }

  /**
   * @dev Constant function, returns the current periodId:
   */
  function currentClearancePeriod() constant returns(uint) {
    require(block.number >= startBlock);
    return ((block.number - startBlock)/clearancePeriodDuration);
  }

  /**
   * @dev Constant function, computes the amount of tokens received in return for _value in _batchId.
   * @param _value Value in wei.
   * @param _batchId the batch for which the rate is calulated.
   */
  function tokensForValue(uint _value, uint _batchId) constant returns(uint) {
    return _value*initialRate*(rateFractionNumerator**_batchId)/(rateFractionDenominator**_batchId);
  }

  /**
   * @dev Intenal function, on receving donation it advances the current batch.
   * Also responsible to check that a donation with limited batches is valid!
   * @param _value Value in wei.
   * @param _isLimitedBatches A flag to indicate if donator is using the final batch feature.
   * @param _finalBatch the final batch itsels, only matters if the flag is true.
   */
  function advanceCurrentBatch(uint _value, bool _isLimitedBatches, uint _finalBatch) internal {
    // Check if donation filled current batch:
    if (_value < partLeftOfCurrentBatch) {
      partLeftOfCurrentBatch += _value;
    }
    else {
      uint _valueLeft = _value - partLeftOfCurrentBatch;
      partLeftOfCurrentBatch = _valueLeft%batchSize;
      currentBatchId += _valueLeft/batchSize + 1;
      // Allow only donations with _finalBatch that can be fulfilled on arrival:
      if ((_isLimitedBatches) && (_finalBatch <= currentBatchId)) {
        revert();
      }
      // Raise event that bach is filled:
      LogBatchFilled(currentBatchId - 1);
    }
  }

  /**
   * @dev The actual donation function.
   * @param _benificiary The address that will receive the tokens.
   * @param _isLimitedBatches A flag to indicate if donator is using the final batch feature.
   * @param _finalBatch the final batch itsels, only matters if the flag is true.
   */
  function donate(address _benificiary, bool _isLimitedBatches, uint _finalBatch) payable {
    // Check valid donation:
    require(isActive());
    require(msg.value > minDonation);

    // First donation of the period sets the starting batch of the period:
    uint currentPeriod = currentClearancePeriod();
    if ((currentPeriod != 0) && (startingBatchOfPeriod[currentPeriod] == 0) )
    {
      currentBatchId ++;
      partLeftOfCurrentBatch = batchSize;
      startingBatchOfPeriod[currentPeriod] = currentBatchId;
    }

    // Write donation data:
    Donation memory donation;
    donation.donator = msg.sender;
    donation.benificiary = _benificiary;
    donation.value = msg.value;
    donation.leftToClear = msg.value;
    donation.isLimitedBatches = _isLimitedBatches;
    donation.finalBatch = _finalBatch;
    donation.startingBatch = startingBatchOfPeriod[currentPeriod];
    donations[donationCounter] = donation;
    donationCounter++;

    // Update batch data and total received:
    batches[currentBatchId].numOfDonations++;
    batches[currentBatchId].totalForProRata += msg.value;
    if (_isLimitedBatches) {
      batches[_finalBatch].totalFinalBatchDonations += msg.value;
    }
    totalReceived += msg.value;

    // Update currentBatchId and check valid limited batch transaction:
    advanceCurrentBatch(msg.value, _isLimitedBatches, _finalBatch);

    // Raise event:
    LogDonationReceived(donation.donator, donation.benificiary, donation.value, currentPeriod, donation.isLimitedBatches, donation.finalBatch);

    // Send funds to target if unlimited batches:
    if (! _isLimitedBatches) {
      totalDonated += msg.value;
      target.transfer(msg.value);
    }
  }


  /**
   * @dev Fallback function.
   * upon receivng funds, treat it as donation with default parameters, namely no final batch.
   */
  function () payable {
    donate(msg.sender, false, 0);
  }

  /**
   * @dev Intenal function, clearing a single batch for a single donation.
   * Batch is not received as a parameter, it is the first non-cleared batch, forcing the clearing to be ordered.
   * Returns the amount of tokends that should be minted for the donation on this batch.
   * @param _donationId The donation for which the batch will be cleared.
   */
  function clearDonationNextBatch(uint _donationId) internal returns(uint) {
    Donation memory donation = donations[_donationId];

    // Check if something is left to be cleared:
    if (donation.leftToClear == 0)
      return 0;

    // Check batch is closed:
    uint batchId = donation.startingBatch + donation.clearedBatches;
    if (batchId != 0) {
      require(batchId < startingBatchOfPeriod[currentClearancePeriod()]);
    }

    // Check reminder was cllected, if not, collect:
    Batch memory batch = batches[batchId];
    if ((batchId != 0) && (! batches[batchId].isReminderCollected) ) {
      batches[batchId].isReminderCollected = true;
      int reminder = int(batches[batchId-1].totalForProRata - batchSize - batches[batchId-1].totalFinalBatchDonations);
      if (reminder > 0) {
          batches[batchId].totalForProRata += uint(reminder);
      }
    }

    // Advance clearing counter:
    donation.clearedBatches++;

    // my Share From Batch:
    uint currentShareOfBatch = batchSize*donation.leftToClear/batch.totalForProRata;
    donation.leftToClear -= currentShareOfBatch;

    // Return funds if final batch for donation:
    if ( (donation.isLimitedBatches) && (donation.finalBatch == batchId)) {
      uint tmp = donation.leftToClear;
      donation.leftToClear = 0; // Avoid re-entry issues.
      target.transfer(tmp);
      donation.donator.transfer(tmp);
    }

    // Compute tokens:
    uint tokens = tokensForValue(currentShareOfBatch, batchId);

    // Raise event and return tokens:
    LogBatchCleared(_donationId, batchId, currentShareOfBatch, tokens);
    return tokens;
  }

  /**
   * @dev Clearing a number of consecutive batches for a specific donation.
   * Although not really necessary, only the doner (or the admin) can clear his own donation.
   * The tokens are minted for all batches together, to save gas.
   * @param _donationId The donation for which the batch will be cleared.
   * @param _numOfBatchesToClear The number of batches to be cleared (to avoid running our of gas).
   */
  function selfClearing (uint _donationId, uint _numOfBatchesToClear) {
    require(donations[_donationId].donator == msg.sender);
    uint tokensToMint;
    for (uint cnt = 0; cnt < _numOfBatchesToClear; cnt++) {
      tokensToMint += clearDonationNextBatch(_donationId);
    }
    LogMintTokens(donations[_donationId].benificiary, tokensToMint);
    controller.mintTokens(tokensToMint, donations[_donationId].benificiary);
  }

  /**
   * @dev Clearing a number of consecutive batches for several donations.
   * Although not really necessary, can only called by the admin.
   * The tokens are minted for all batches of a single donation together, to save gas.
   * @param _donationsIdArray Array of donations to clear.
   * @param _numOfBatchesToClear The number of batches to be cleared for all each donation.
   */
  function adminMultiClearing(uint[] _donationsIdArray, uint _numOfBatchesToClear) onlyAdmin {
    uint tokensToMint;
    for (uint cnt=0; cnt < _donationsIdArray.length; cnt++) {
      tokensToMint = 0;
      for (uint cnt2 = 0; cnt2 < _numOfBatchesToClear; cnt2++) {
        clearDonationNextBatch(_donationsIdArray[cnt]);
      }
      LogMintTokens(donations[_donationsIdArray[cnt]].benificiary, tokensToMint);
      controller.mintTokens(tokensToMint, donations[_donationsIdArray[cnt]].benificiary);
    }
  }
}
