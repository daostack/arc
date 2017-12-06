pragma solidity ^0.4.18;

import "../controller/Controller.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "../test/Debug.sol";


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

contract EmergentICO is Debug {
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
        uint value; // Value of the donation in wei.
        uint minRate; // If the rate is lower than this, the funds will be returned.
        bool isCollected; // A flag to check if tokens/funds were already collected.
    }

    // Data for each period:
    struct Period {
        uint donationsCounterInPeriod;
        uint raisedUpToPeriod; // How much was raised up to this period.
        uint averageRate; // The calculated average rate of the period.
        uint donationsWithMinRateEqualToZero;
        uint donationsWithMinRateEqualToRate;
        uint donationsWithMinRateEqualToRateToInclude;
        bool isInitialized; // A flag to indicate that the previous period was calculated and so raisedUpToPeriod is set.
        bool isAverageRateComputed; // A flag to indicate that the average for this period was computed.
        uint[] donationsIdsWithLimit; // An array for the donations that use the limit feature.
    }

    // Data for every attempt for computing an average for a period.
    struct AverageComputator {
        uint periodId; // The period for which the computation is done.
        uint donationsCounted; // A counter used in the validation of the computation.
        uint hintRate; //
        uint hintTotalDonatedInThisPeriod; // [cf doc for initAverageComputation]
        uint donationsWithMinRateEqualToRate;
        uint donationsWithMinRateLowerThanRate;
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
    address public beneficiary; // The funds will be transfered here.
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
    * @param _beneficiary The beneficiary of the ICO (who gets the funds)
    * @param _admin The administrator of the ICO
    * @param _startBlock The blocknumber at which the ico starts
    * @param _periodDuration The length of each period
    * @param _minDonation The minimal donation
    * @param _initialRate The price of tokens in the first block (in tokens/ETH)
    */
    function EmergentICO(
        Controller _controller,
        address _admin,
        address _beneficiary,
        uint _startBlock,
        uint _periodDuration,
        uint _minDonation,
        uint _initialRate,
        uint _rateFractionNumerator,
        uint _rateFractionDenominator,
        uint _batchSize
    ) public
    {
        // Set parameters:
        controller = _controller;
        admin = _admin;
        beneficiary = _beneficiary;
        startBlock = _startBlock; // [cf doc for initAverageComputation]
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
    function haltICO() public onlyAdmin {
        isHalted = true;
    }

    /**
    * @dev Resuming ICO, using onlyAdmin modifier:
    */
    function resumeICO() public onlyAdmin {
        isHalted = false;
    }

    /**
    * @dev Modifier, Check if a given period is initialized for average computations:
    * @param _periodId the period checked.
    */
    function getIsPeriodInitialized(uint _periodId) public constant returns(bool) {
        return(periods[_periodId].isInitialized);
    }

    /**
    * @dev Constant boolean function, checking if the ICO is active:
    */
    function isActive() public constant returns(bool) {
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
    function currentPeriodId() public constant returns(uint) {
        return ((block.number.sub(startBlock))/periodDuration);
    }

    /**
    * @dev Constant function, computes the rate for a given batch:
    * @param _batch the (index of) the batch for which the computation is done.
    */
    function rateInWei(uint _batch) public constant returns(uint) {
        return (((10**18)*initialRate).mul(rateFractionNumerator**_batch)/rateFractionDenominator**_batch);
    }

    /**
    * @dev Constant function, computes the average rate between two points.
    * @param _start the starting point for the computation - expressed in  Wei donated
    * @param _end the end point for the computation, expressed in Wei donated.
    */
    function averageRateInWei(uint _start, uint _end) public constant returns(uint) {
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
    function donate(address _beneficiary, uint _minRate) public payable {
        // Check ICO is open:
        require(isActive());

        // Check minimum donation:
        require(msg.value >= minDonation);

        // Update period data:
        uint currentPeriod = currentPeriodId();
        Period storage period = periods[currentPeriod];
        period.donationsCounterInPeriod++;
        if (_minRate != 0) {
            period.donationsIdsWithLimit.push(donationCounter);
        } else {
            period.donationsWithMinRateEqualToZero = period.donationsWithMinRateEqualToZero.add(msg.value);
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

        // If minimum rate is 0 move funds to beneficiary now:
        if (_minRate == 0) {
            beneficiary.transfer(msg.value);
        }

        // If we can determine that the donation will not go through, revert:
        if (_minRate != 0 && period.isInitialized) {
            if (averageRateInWei(period.raisedUpToPeriod, period.raisedUpToPeriod.add(period.donationsWithMinRateEqualToZero)) < _minRate) {
                revert();
            }
        }

        // Event:
        LogDonationReceived(
            donationCounter-1,
            msg.sender,
            _beneficiary,
            currentPeriodId(),
            msg.value,
            _minRate
        );
    }

    /**
    * @dev Fallback function.
    * upon receivng funds, treat it as donation with default parameters, minRate=0.
    */
    function () public payable {
        donate(msg.sender, 0);
    }

    /**
    * @dev an agent can set what he thinks is the correct average for a period and start the test.
    * @param _periodId the period for which average is computed.
    * @param _iterations number of iterations to check from the array donationsIdsWithLimit.
    */
    function initAverageComputation(
        uint _periodId,
        uint _hintTotalDonatedInThisPeriod,
        uint _iterations
    )
        public
        isPeriodOver(_periodId)
        isPeriodInitialized(_periodId)
    {
        uint hintRate = averageRateInWei(periods[_periodId].raisedUpToPeriod, periods[_periodId].raisedUpToPeriod.add(_hintTotalDonatedInThisPeriod));
        averageComputators[msg.sender] = AverageComputator({
            periodId: _periodId,
            donationsCounted: 0,
            hintRate: hintRate,
            hintTotalDonatedInThisPeriod: _hintTotalDonatedInThisPeriod,
            donationsWithMinRateEqualToRate: 0,
            donationsWithMinRateLowerThanRate: periods[_periodId].donationsWithMinRateEqualToZero
        });
        computeAverage(_periodId, _iterations);
    }

    /**
    * @dev compute the statistics (average payout, eth raised, eth to be refunded) for a given period
    * because the computation can be very long, the function takes a parameter "_iterations" that limits
    * the computation. "_iterations" is bounded by period.donationsIdsWithLimit.
    *  some configuration, and intermediate results, are stored in AverageComputators[msg.sender]
    * @param _periodId the period for which average is computed.
    * @param _iterations number of iterations to check from the array donationsIdsWithLimit.
    */
    function computeAverage(uint _periodId, uint _iterations)
        public
        isPeriodOver(_periodId)
        isPeriodInitialized(_periodId)
    {
        Period storage period = periods[_periodId];
        AverageComputator storage avgComp = averageComputators[msg.sender];
        // TODO: the next statement is superfluous - either just not provide the _periodId argument
        // or (better) have different avgComp objects for each _periodÍd
        require(avgComp.periodId == _periodId);

        // Run over the array of donors with a minRate and keep track of those with lower, or equal, minRate
        for (uint cnt = 0; cnt < _iterations; cnt++) {
            if (avgComp.donationsCounted >= period.donationsIdsWithLimit.length) {
                // we have counted all donors in this period and can move on to the payout
                break;
            }
            // get the next donation with a minRate that we need to process
            uint donationId = period.donationsIdsWithLimit[avgComp.donationsCounted];

            if (donations[donationId].minRate < avgComp.hintRate ) {
                // a donation that has a minRate that is lower than the expected rate is included
                avgComp.donationsWithMinRateLowerThanRate = avgComp.donationsWithMinRateLowerThanRate.add(donations[donationId].value);
            } else if (donations[donationId].minRate == avgComp.hintRate) {
                // a donation with a minRate equal to the expected rate:
                // we keep track of these donations  and calculate the amount to return later on
                avgComp.donationsWithMinRateEqualToRate = avgComp.donationsWithMinRateEqualToRate.add(donations[donationId].value);
            }
            avgComp.donationsCounted++;
        }

        // if we have checked all donations, we are ready to check if the result is as hinted
        if (avgComp.donationsCounted == period.donationsIdsWithLimit.length) {

            // check correctness of the calculation
            if (avgComp.donationsWithMinRateLowerThanRate > avgComp.hintTotalDonatedInThisPeriod) {
                LogString("Calculation failed: donationsWithMinRateLowerThanRate > hintTotalDonatedInThisPeriod");
                delete averageComputators[msg.sender];
                return;
            }
            /*if (avgComp.donationsWithMinRateLowerThanRate + avgComp.donationsWithMinRateEqualToRate < avgComp.hintTotalDonatedInThisPeriod){
            LogString('Calculation failed: davgComp.donationsWithMinRateLowerThanRate + avgComp.donationsWithMinRateEqualToRate < avgComp.hintTotalDonatedInThisPeriod');
            delete averageComputators[msg.sender];
            return;
            }*/

            period.isAverageRateComputed = true;
            period.averageRate = avgComp.hintRate;
            period.donationsWithMinRateEqualToRate = avgComp.donationsWithMinRateEqualToRate;
            period.donationsWithMinRateEqualToRateToInclude = avgComp.hintTotalDonatedInThisPeriod - avgComp.donationsWithMinRateLowerThanRate;

            periods[_periodId+1].raisedUpToPeriod = period.raisedUpToPeriod.add(avgComp.hintTotalDonatedInThisPeriod);
            periods[_periodId+1].isInitialized = true;
            delete averageComputators[msg.sender];
            LogPeriodAverageComputed(_periodId);
        }
    }

    /**
    * @dev Collecting donor own tokens.
    * Although not really necessary, only the donor (or the admin) can clear his own donation.
    * @param _donationId The donation to be cleared.
    */
    function collectMyTokens(uint _donationId) public {
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
    function collectMulti(uint[] _donationIds) public onlyAdmin {
        for (uint cnt = 0; cnt<_donationIds.length; cnt++) {
            collectTokens(_donationIds[cnt]);
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
        require(donation.periodId < currentPeriodId());
        require(period.isAverageRateComputed);

        if (donation.isCollected) {
            return;
        }

        // Mark donation as collected:
        donation.isCollected = true;

        // Check the donation minimum rate is valid, if so mint tokens, else, return funds:
        uint tokensToMint = 0;
        uint ethToReturn = 0;
        uint ethToSpendOnTokens = 0;

        if (donation.minRate == 0) {
            tokensToMint = period.averageRate.mul(donation.value)/(10**18);
          // we do not set ethToSpendOnTokens, because the transfer has already taken place in donation()
        } else if (donation.minRate < period.averageRate) {
            ethToSpendOnTokens = donation.value;
            tokensToMint = period.averageRate.mul(ethToSpendOnTokens)/(10**18);
        } else if (donation.minRate == period.averageRate) {
            ethToSpendOnTokens = donation.value.mul(period.donationsWithMinRateEqualToRateToInclude).div(period.donationsWithMinRateEqualToRate);
            tokensToMint = period.averageRate.mul(ethToSpendOnTokens)/(10**18);
            ethToReturn = donation.value - ethToSpendOnTokens;
        } else {
            ethToReturn = donation.value;
        }
        if (tokensToMint > 0) {
            controller.mintTokens(tokensToMint, donation.beneficiary);
        }
        if (ethToReturn > 0) {
            donation.donor.transfer(ethToReturn);
        }

        if (ethToSpendOnTokens > 0) {
            beneficiary.transfer(ethToSpendOnTokens);
        }
        LogString("ethToSpendOnTokens");
        LogUint(ethToSpendOnTokens);
        LogCollect(_donationId, tokensToMint, ethToReturn);
    }
}
