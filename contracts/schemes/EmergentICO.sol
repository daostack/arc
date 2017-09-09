pragma solidity ^0.4.11;

import "../controller/Controller.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @title EmergentICO
 * @dev An ICO model that is trying to be fair for all sides.
 * The ICO is divided into "Periods" in which a fixed number of tokens is available
 * - each period has the same duration (set by periodDuration)
 * - within a period, all donors get the same rate (rate=tokens per 1 ether).
 * - within a period, each donor gets an amount of tokens that are proportional to her donation
 * - the rate decreases exponentially, with each batch
 * - a batch is an amount (in Wei) of eth donated
 * - at the end of each period an average of the exponential rate is computed, and all donors get their tokens for that price
 * - donators can specify a minimum rate (i.e. a maximum price) of their donation
 * - if the average rate of the period is lower than the minimum pointed by donor, donor will be refunded.
 */

contract EmergentICO {
  using SafeMath for uint;

  event LogDonationReceived
  (
    uint indexed _donationId,
    address indexed _donor,
    address indexed _beneficiary,
    uint _periodId,
    uint _value,
    uint _minRate
  );
  event LogPeriodAverageComputed(uint _periodId);
  event LogCollect(uint _donation, uint _tokens, uint _ether);

  // The data saved for each donation:
  struct Donation {
    address donor;
    address beneficiary; // The tokens will be alocated to this address.
    uint periodId; // Donation's period.
    uint value; // Value in wei.
    uint minRate; // If the rate is lower than this, the funds will be returned.
    bool isCollected; // A flag to check if tokens/funds were already collected.
  }

  // Data for each period:
  struct Period {
    uint donationsCounterInPeriod;
    uint clearedDonations; // Number of donations cleared.
    uint incomingInPeriod; // The total incoming donations in wei.
    uint raisedInPeriod; // The total raised (incoming minus returned).
    uint raisedUpToPeriod; // How much was raised up to this period.
    uint averageRate; // The calculated average rate of the period.
    bool isInitialized; // A flag to indicate that the previous period was calculated and so raisedUpToPeriod is set.
    bool isAverageRateComputed; // A flag to indicate that the average for this period was computed.
    uint[] donationsIdsWithLimit; // An array for the donations that use the limit feature.
  }

  // Data for every attempt for computing an average for a period.
  struct AverageComputator {
    uint periodId; // The period for which the computation is done.
    uint averageRateComputed; // The result of the computation suggested by this computator.
    uint donorsCounted; // A counter used in the validation of the computation.
    uint fundsToBeReturned; // A variable used in the validation of the computation.
  }

  // Mapping from donation ID to the donation. IDs are sequential 0,1,2..
  mapping (uint=>Donation) public donations;
  // Mapping from period ID to the period. IDs are sequential 0,1,2..
  mapping (uint=>Period) public periods;
  // Mapping from address of an agent, to the data of the computation he suggested.
  mapping (address=>AverageComputator) public averageComputators;

  // Parameters:
  Controller public controller; // The conroller is responsible to mint tokens.
  address public admin; // Admin can halt and resume the ICO, and also clear batches for everyone.
  address public target; // The funds will be tranffered here.
  uint public startBlock; // ICO starting block.
  uint public periodDuration; // The length of each clearance period in blocks.
  uint public minDonation; // The minimum allowed donation in wei.
  // Rate function is initialRate*(rateFractionNumerator/rateFractionDenominator)^n.
  uint public initialRate;
  uint public rateFractionNumerator;
  uint public rateFractionDenominator;

  uint public batchSize; //

  // Variables:
  uint public totalReceived; // Total of funds received in the contract, including the returned change.
  uint public totalDonated; // The total funds actually donated.
  uint public donationCounter;
  bool public isHalted; // Flag to indicate ICO is halted.

  /**
   * @dev Modifier, Allow only an admin to access:
   */
  modifier onlyAdmin() {
    require(msg.sender == admin);
    _;
  }

  /**
   * @dev Modifier, Check if a given period is finished:
   * @param _periodId the period checked.
   */
  modifier isPeriodOver(uint _periodId) {
    require(_periodId < currentPeriodId());
    _;
  }

  /**
   * @dev Modifier, Check if a given period is initialized for average computations:
   * @param _periodId the period checked.
   */
  modifier isPeriodInitialized(uint _periodId) {
    require(periods[_periodId].isInitialized);
    _;
  }

  /**
   * @dev Constructor, setting all the parameters:
   * @param _controller The address of an Organization
   * @param _target The beneficiary of the ICO (who gets the funds)
   * @param _admin The administrator of the ICO
   * @param _startBlock The blocknumber at which the ico starts
   * @param _periodDuration The length of each period
   * @param _minDonation The minimal donation
   * @param _initialRate The price of tokens in the first block (in tokens/ETH)
   */
  function EmergentICO(
    Controller _controller,
    address _admin,
    address _target,
    uint _startBlock,
    uint _periodDuration,
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
      periodDuration = _periodDuration;
      minDonation = _minDonation;
      initialRate = _initialRate;
      rateFractionNumerator = _rateFractionNumerator;
      rateFractionDenominator = _rateFractionDenominator;
      batchSize = _batchSize;

      // Initialize:
      periods[0].isInitialized = true;
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
   * @dev Modifier, Check if a given period is initialized for average computations:
   * @param _periodId the period checked.
   */
  function getIsPeriodInitialized(uint _periodId) constant returns(bool) {
    return(periods[_periodId].isInitialized);
  }

  /**
   * @dev Constant boolean function, checking if the ICO is active:
   */
  function isActive() constant returns(bool) {
    if (isHalted) {
      return false;
    }
    if (block.number < startBlock) {
      return false;
    }
    return true;
  }

  /**
   * @dev Constant function, returns the periodId of the current block:
   */
  function currentPeriodId() constant returns(uint) {
    return ((block.number.sub(startBlock))/periodDuration);
  }

  /**
   * @dev Constant function, computes the rate for a given batch:
   * @param _batch the (index of) the batch for which the computation is done.
   */
  function rateInWei(uint _batch) constant returns(uint) {
    return (((10**18)*initialRate).mul(rateFractionNumerator**_batch)/rateFractionDenominator**_batch);
  }

  /**
   * @dev Constant function, computes the average rate between two points.
   * @param _start the starting point for the computation - expressed in  Wei donated
   * @param _end the starting point for the computation, expressed in Wei donated.
   */
  function averageRateInWei(uint _start, uint _end) constant returns(uint) {
    assert(_end >= _start);
    uint batchStart = _start/batchSize;
    uint batchEnd = _end/batchSize;
    uint partOfStartBatch = batchSize.sub(_start%batchSize);
    uint partOfEndBatch = _end%batchSize;
    uint delta = batchEnd.sub(batchStart);

    if (delta == 0) {
        return rateInWei(batchStart);
    }
    if (delta == 1) {
        return ((partOfStartBatch.mul(rateInWei(batchStart))).add(partOfEndBatch.mul(rateInWei(batchEnd))))/(_end-_start);
    }
    if (delta > 1) {
        uint geomSeries = (batchSize.mul(rateInWei(batchStart+1).sub(rateInWei(batchEnd)))).mul(rateFractionDenominator)/(rateFractionDenominator.sub(rateFractionNumerator));
        return ((geomSeries.add(partOfStartBatch.mul(rateInWei(batchStart)))).add(partOfEndBatch.mul(rateInWei(batchEnd))))/(_end-_start);
    }
  }

  /**
   * @dev The actual donation function.
   * @param _beneficiary The address that will receive the tokens.
   * @param _minRate the minimum rate the donor is willing to participate in.
   */
  function donate(address _beneficiary, uint _minRate) payable {
    // Check ICO is open:
    require(isActive());

    // Check minimum donation:
    require(msg.value >= minDonation);

    // Update period data:
    uint currentPeriod = currentPeriodId();
    Period storage period = periods[currentPeriod];
    period.incomingInPeriod = period.incomingInPeriod.add(msg.value);
    period.donationsCounterInPeriod++;
    if (_minRate != 0) {
      period.donationsIdsWithLimit.push(donationCounter);
    } else {
      period.raisedInPeriod = period.raisedInPeriod.add(msg.value);
    }

    // Update donation data:
    donations[donationCounter] = Donation({
      donor: msg.sender,
      beneficiary: _beneficiary,
      periodId: currentPeriod,
      value: msg.value,
      minRate: _minRate,
      isCollected: false
    });
    donationCounter++;
    totalReceived = totalReceived.add(msg.value);

    // If minimum rate is 0 move funds to target now:
    if (_minRate == 0) {
      totalDonated = totalDonated.add(msg.value);
      target.transfer(msg.value);
    }

    // If we can determine that the donation will not go through, revert:
    if (_minRate != 0 && period.isInitialized) {
      if (averageRateInWei(period.raisedUpToPeriod, period.raisedUpToPeriod.add(period.raisedInPeriod)) < _minRate) {
        revert();
      }
    }

    // Event:
    LogDonationReceived(donationCounter-1, msg.sender, _beneficiary, currentPeriodId(), msg.value, _minRate);
  }

  /**
   * @dev Fallback function.
   * upon receivng funds, treat it as donation with default parameters, minRate=0.
   */
  function () payable {
    donate(msg.sender, 0);
  }

  /**
   * @dev an agent can set what he thinks is the correct average for a period and start the test.
   * @param _periodId the period for which average is computed.
   * @param _average the average computed by the user.
   * @param _iterations number of iterations to check from the array donationsIdsWithLimit.
   */
  function setAverageAndTest(uint _periodId, uint _average, uint _iterations)
    isPeriodOver(_periodId)
    isPeriodInitialized(_periodId)
  {
    averageComputators[msg.sender] = AverageComputator({
      periodId: _periodId,
      donorsCounted: 0,
      averageRateComputed: _average,
      fundsToBeReturned: 0
    });
    checkAverage(_periodId, _iterations);
  }

  /**
   * @dev compute the statistics (average payout, eth raised, eth to be refunded) for a given period
   * because the computation can be very long, the function takes a parameter "_iterations" that limits
   * the computation. "_iterations" is bounded by period.donationsIdsWithLimit.
   *
   * @param _periodId the period for which average is computed.
   * @param _iterations number of iterations to check from the array donationsIdsWithLimit.
   */
  function checkAverage(uint _periodId, uint _iterations)
    isPeriodOver(_periodId)
    isPeriodInitialized(_periodId)
  {
    Period storage period = periods[_periodId];
    AverageComputator storage avgComp = averageComputators[msg.sender];
    require(avgComp.periodId == _periodId);

    // Run over the array of donors with limit, sum the ones that are to be refunded:
    for (uint cnt=0; cnt < _iterations; cnt++) {
      uint donationId = period.donationsIdsWithLimit[avgComp.donorsCounted];
      if (donations[donationId].minRate > avgComp.averageRateComputed) {
        avgComp.fundsToBeReturned = avgComp.fundsToBeReturned.add(donations[donationId].value);
      }
      avgComp.donorsCounted++;
    }
    // Check if finished:
    if (avgComp.donorsCounted == period.donationsIdsWithLimit.length) {
      uint computedRaisedInPeriod = period.incomingInPeriod.sub(avgComp.fundsToBeReturned);
      uint computedRate = averageRateInWei(period.raisedUpToPeriod, periods[_periodId].raisedUpToPeriod.add(computedRaisedInPeriod));
      if (computedRate == avgComp.averageRateComputed) {
        period.isAverageRateComputed = true;
        period.raisedInPeriod = computedRaisedInPeriod;
        period.averageRate = computedRate;
        periods[_periodId+1].raisedUpToPeriod = period.raisedUpToPeriod.add(period.raisedInPeriod);
        periods[_periodId+1].isInitialized = true;
        delete averageComputators[msg.sender];
        LogPeriodAverageComputed(_periodId);
      }
    }
  }

  /**
   * @dev Internal function, clearing donation, either minting tokens or refunding.
   * @param _donationId The donation to be cleared.
   */
  function collectTokens(uint _donationId) internal {
    Donation storage donation = donations[_donationId];
    Period storage period = periods[donation.periodId];

    // Check collection is possible:
    require(donation.periodId  < currentPeriodId());
    require(period.isAverageRateComputed);

    if (donation.isCollected) {
      return;
    }

    // Mark donation as collected:
    donation.isCollected = true;
    period.clearedDonations++;

    // Check the donation minimum rate is valid, if so mint tokens, else, return funds:
    if (donation.minRate < period.averageRate) {
      uint tokensToMint = period.averageRate.mul(donation.value)/(10**18);
      controller.mintTokens(tokensToMint, donation.beneficiary);
      totalDonated = totalDonated.add(donation.value);
      LogCollect(_donationId, tokensToMint, 0);
    } else {
      donation.donor.transfer(donation.value);
      LogCollect(_donationId, 0, donation.value);
    }
  }

  /**
   * @dev Collecting donor own tokens.
   * Although not really necessary, only the doner (or the admin) can clear his own donation.
   * @param _donationId The donation to be cleared.
   */
  function collectMine(uint _donationId) {
    // Check sender is indeed the donor:
    require(msg.sender == donations[_donationId].donor);
    // Collect:
    collectTokens(_donationId);
  }

  /**
   * @dev OnlyAdmin function, can clear donations for everyone.
   * Although not really necessary, only the doner (or the admin) can clear his own donation.
   * @param _donationIds array of donations to be cleared.
   */
  function collectMulti(uint[] _donationIds) onlyAdmin {
    for (uint cnt=0; cnt<_donationIds.length; cnt++) {
      collectTokens(_donationIds[cnt]);
    }
  }
}
