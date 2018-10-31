pragma solidity ^0.4.25;

/**
 * RealMath: fixed-point math library, based on fractional and integer parts.
 * Using int256 as real216x40, which isn't in Solidity yet.
 * 40 fractional bits gets us down to 1E-12 precision, while still letting us
 * go up to galaxy scale counting in meters.
 * Internally uses the wider int256 for some math.
 *
 * Note that for addition, subtraction, and mod (%), you should just use the
 * built-in Solidity operators. Functions for these operations are not provided.
 *
 * Note that the fancy functions like sqrt, atan2, etc. aren't as accurate as
 * they should be. They are (hopefully) Good Enough for doing orbital mechanics
 * on block timescales in a game context, but they may not be good enough for
 * other applications.
 */


library RealMath {

    /**
     * How many total bits are there?
     */
    int256 constant REAL_BITS = 256;

    /**
     * How many fractional bits are there?
     */
    int256 constant REAL_FBITS = 40;

    /**
     * How many integer bits are there?
     */
    int256 constant REAL_IBITS = REAL_BITS - REAL_FBITS;

    /**
     * What's the first non-fractional bit
     */
    int256 constant REAL_ONE = int256(1) << REAL_FBITS;

    /**
     * What's the last fractional bit?
     */
    int256 constant REAL_HALF = REAL_ONE >> 1;

    /**
     * What's two? Two is pretty useful.
     */
    int256 constant REAL_TWO = REAL_ONE << 1;

    /**
     * And our logarithms are based on ln(2).
     */
    int256 constant REAL_LN_TWO = 762123384786;

    /**
     * It is also useful to have Pi around.
     */
    int256 constant REAL_PI = 3454217652358;

    /**
     * And half Pi, to save on divides.
     * TODO: That might not be how the compiler handles constants.
     */
    int256 constant REAL_HALF_PI = 1727108826179;

    /**
     * And two pi, which happens to be odd in its most accurate representation.
     */
    int256 constant REAL_TWO_PI = 6908435304715;

    /**
     * What's the sign bit?
     */
    int256 constant SIGN_MASK = int256(1) << 255;


    /**
     * Convert an integer to a real. Preserves sign.
     */
    function toReal(int216 ipart) internal pure returns (int256) {
        return int256(ipart) * REAL_ONE;
    }

    /**
     * Convert a real to an integer. Preserves sign.
     */
    function fromReal(int256 realValue) internal pure returns (int216) {
        return int216(realValue / REAL_ONE);
    }

    /**
     * Round a real to the nearest integral real value.
     */
    function round(int256 realValue) internal pure returns (int256) {
        // First, truncate.
        int216 ipart = fromReal(realValue);
        if ((fractionalBits(realValue) & (uint40(1) << (REAL_FBITS - 1))) > 0) {
            // High fractional bit is set. Round up.
            if (realValue < int256(0)) {
                // Rounding up for a negative number is rounding down.
                ipart -= 1;
            } else {
                ipart += 1;
            }
        }
        return toReal(ipart);
    }

    /**
     * Get the absolute value of a real. Just the same as abs on a normal int256.
     */
    function abs(int256 realValue) internal pure returns (int256) {
        if (realValue > 0) {
            return realValue;
        } else {
            return -realValue;
        }
    }

    /**
     * Returns the fractional bits of a real. Ignores the sign of the real.
     */
    function fractionalBits(int256 realValue) internal pure returns (uint40) {
        return uint40(abs(realValue) % REAL_ONE);
    }

    /**
     * Get the fractional part of a real, as a real. Ignores sign (so fpart(-0.5) is 0.5).
     */
    function fpart(int256 realValue) internal pure returns (int256) {
        // This gets the fractional part but strips the sign
        return abs(realValue) % REAL_ONE;
    }

    /**
     * Get the fractional part of a real, as a real. Respects sign (so fpartSigned(-0.5) is -0.5).
     */
    function fpartSigned(int256 realValue) internal pure returns (int256) {
        // This gets the fractional part but strips the sign
        int256 fractional = fpart(realValue);
        if (realValue < 0) {
            // Add the negative sign back in.
            return -fractional;
        } else {
            return fractional;
        }
    }

    /**
     * Get the integer part of a fixed point value.
     */
    function ipart(int256 realValue) internal pure returns (int256) {
        // Subtract out the fractional part to get the real part.
        return realValue - fpartSigned(realValue);
    }

    /**
     * Multiply one real by another. Truncates overflows.
     */
    function mul(int256 realA, int256 realB) internal pure returns (int256) {
        // When multiplying fixed point in x.y and z.w formats we get (x+z).(y+w) format.
        // So we just have to clip off the extra REAL_FBITS fractional bits.
        return int256((int256(realA) * int256(realB)) >> REAL_FBITS);
    }

    /**
     * Divide one real by another real. Truncates overflows.
     */
    function div(int256 realNumerator, int256 realDenominator) internal pure returns (int256) {
        // We use the reverse of the multiplication trick: convert numerator from
        // x.y to (x+z).(y+w) fixed point, then divide by denom in z.w fixed point.
        return int256((int256(realNumerator) * REAL_ONE) / int256(realDenominator));
    }

    /**
     * Create a real from a rational fraction.
     */
    function fraction(int216 numerator, int216 denominator) internal pure returns (int256) {
        return div(toReal(numerator), toReal(denominator));
    }

    // Now we have some fancy math things (like pow and trig stuff). This isn't
    // in the RealMath that was deployed with the original Macroverse
    // deployment, so it needs to be linked into your contract statically.

    /**
     * Raise a number to a positive integer power in O(log power) time.
     * See <https://stackoverflow.com/a/101613>
     */
    function ipow(int256 realBase, int216 exponent) internal pure returns (int256) {
        if (exponent < 0) {
            // Negative powers are not allowed here.
            revert();
        }

        int256 tempRealBase = realBase;
        int256 tempExponent = exponent;

        // Start with the 0th power
        int256 realResult = REAL_ONE;
        while (tempExponent != 0) {
            // While there are still bits set
            if ((tempExponent & 0x1) == 0x1) {
                // If the low bit is set, multiply in the (many-times-squared) base
                realResult = mul(realResult, tempRealBase);
            }
            // Shift off the low bit
            tempExponent = tempExponent >> 1;
            // Do the squaring
            tempRealBase = mul(tempRealBase, tempRealBase);
        }

        // Return the final result.
        return realResult;
    }

    /**
     * Zero all but the highest set bit of a number.
     * See <https://stackoverflow.com/a/53184>
     */
    function hibit(uint256 _val) internal pure returns (uint256) {
        // Set all the bits below the highest set bit
        uint256 val = _val;
        val |= (val >> 1);
        val |= (val >> 2);
        val |= (val >> 4);
        val |= (val >> 8);
        val |= (val >> 16);
        val |= (val >> 32);
        val |= (val >> 64);
        val |= (val >> 128);
        return val ^ (val >> 1);
    }

    /**
     * Given a number with one bit set, finds the index of that bit.
     */
    function findbit(uint256 val) internal pure returns (uint8 index) {
        index = 0;
        // We and the value with alternating bit patters of various pitches to find it.
        if (val & 0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA != 0) {
            // Picth 1
            index |= 1;
        }
        if (val & 0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC != 0) {
            // Pitch 2
            index |= 2;
        }
        if (val & 0xF0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0 != 0) {
            // Pitch 4
            index |= 4;
        }
        if (val & 0xFF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00 != 0) {
            // Pitch 8
            index |= 8;
        }
        if (val & 0xFFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000 != 0) {
            // Pitch 16
            index |= 16;
        }
        if (val & 0xFFFFFFFF00000000FFFFFFFF00000000FFFFFFFF00000000FFFFFFFF00000000 != 0) {
            // Pitch 32
            index |= 32;
        }
        if (val & 0xFFFFFFFFFFFFFFFF0000000000000000FFFFFFFFFFFFFFFF0000000000000000 != 0) {
            // Pitch 64
            index |= 64;
        }
        if (val & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000000000000000000000000000 != 0) {
            // Pitch 128
            index |= 128;
        }
    }

    /**
     * Shift realArg left or right until it is between 1 and 2. Return the
     * rescaled value, and the number of bits of right shift applied. Shift may be negative.
     *
     * Expresses realArg as realScaled * 2^shift, setting shift to put realArg between [1 and 2).
     *
     * Rejects 0 or negative arguments.
     */
    function rescale(int256 realArg) internal pure returns (int256 realScaled, int216 shift) {
        if (realArg <= 0) {
            // Not in domain!
            revert();
        }

        // Find the high bit
        int216 highBit = findbit(hibit(uint256(realArg)));

        // We'll shift so the high bit is the lowest non-fractional bit.
        shift = highBit - int216(REAL_FBITS);

        if (shift < 0) {
            // Shift left
            realScaled = realArg << -shift;
        } else if (shift >= 0) {
            // Shift right
            realScaled = realArg >> shift;
        }
    }

    /**
     * Calculate the natural log of a number. Rescales the input value and uses
     * the algorithm outlined at <https://math.stackexchange.com/a/977836> and
     * the ipow implementation.
     *
     * Lets you artificially limit the number of iterations.
     *
     * Note that it is potentially possible to get an un-converged value; lack
     * of convergence does not throw.
     */
    function lnLimited(int256 realArg, int maxIterations) internal pure returns (int256) {
        if (realArg <= 0) {
            // Outside of acceptable domain
            revert();
        }

        if (realArg == REAL_ONE) {
            // Handle this case specially because people will want exactly 0 and
            // not ~2^-39 ish.
            return 0;
        }

        // We know it's positive, so rescale it to be between [1 and 2)
        int256 realRescaled;
        int216 shift;
        (realRescaled, shift) = rescale(realArg);

        // Compute the argument to iterate on
        int256 realSeriesArg = div(realRescaled - REAL_ONE, realRescaled + REAL_ONE);

        // We will accumulate the result here
        int256 realSeriesResult = 0;

        for (int216 n = 0; n < maxIterations; n++) {
            // Compute term n of the series
            int256 realTerm = div(ipow(realSeriesArg, 2 * n + 1), toReal(2 * n + 1));
            // And add it in
            realSeriesResult += realTerm;
            if (realTerm == 0) {
                // We must have converged. Next term is too small to represent.
                break;
            }
            // If we somehow never converge I guess we will run out of gas
        }

        // Double it to account for the factor of 2 outside the sum
        realSeriesResult = mul(realSeriesResult, REAL_TWO);

        // Now compute and return the overall result
        return mul(toReal(shift), REAL_LN_TWO) + realSeriesResult;

    }

    /**
     * Calculate a natural logarithm with a sensible maximum iteration count to
     * wait until convergence. Note that it is potentially possible to get an
     * un-converged value; lack of convergence does not throw.
     */
    function ln(int256 realArg) internal pure returns (int256) {
        return lnLimited(realArg, 100);
    }

    /**
     * Calculate e^x. Uses the series given at
     * <http://pages.mtu.edu/~shene/COURSES/cs201/NOTES/chap04/exp.html>.
     *
     * Lets you artificially limit the number of iterations.
     *
     * Note that it is potentially possible to get an un-converged value; lack
     * of convergence does not throw.
     */
    function expLimited(int256 realArg, int maxIterations) internal pure returns (int256) {
        // We will accumulate the result here
        int256 realResult = 0;

        // We use this to save work computing terms
        int256 realTerm = REAL_ONE;

        for (int216 n = 0; n < maxIterations; n++) {
            // Add in the term
            realResult += realTerm;

            // Compute the next term
            realTerm = mul(realTerm, div(realArg, toReal(n + 1)));

            if (realTerm == 0) {
                // We must have converged. Next term is too small to represent.
                break;
            }
            // If we somehow never converge I guess we will run out of gas
        }

        // Return the result
        return realResult;

    }

    /**
     * Calculate e^x with a sensible maximum iteration count to wait until
     * convergence. Note that it is potentially possible to get an un-converged
     * value; lack of convergence does not throw.
     */
    function exp(int256 realArg) internal pure returns (int256) {
        return expLimited(realArg, 100);
    }

    /**
     * Raise any number to any power, except for negative bases to fractional powers.
     */
    function pow(int256 realBase, int256 realExponent) internal pure returns (int256) {
        if (realExponent == 0) {
            // Anything to the 0 is 1
            return REAL_ONE;
        }

        if (realBase == 0) {
            if (realExponent < 0) {
                // Outside of domain!
                revert();
            }
            // Otherwise it's 0
            return 0;
        }

        if (fpart(realExponent) == 0) {
            // Anything (even a negative base) is super easy to do to an integer power.

            if (realExponent > 0) {
                // Positive integer power is easy
                return ipow(realBase, fromReal(realExponent));
            } else {
                // Negative integer power is harder
                return div(REAL_ONE, ipow(realBase, fromReal(-realExponent)));
            }
        }

        if (realBase < 0) {
            // It's a negative base to a non-integer power.
            // In general pow(-x^y) is undefined, unless y is an int or some
            // weird rational-number-based relationship holds.
            revert();
        }

        // If it's not a special case, actually do it.
        return exp(mul(realExponent, ln(realBase)));
    }

    /**
     * Compute the square root of a number.
     */
    function sqrt(int256 realArg) internal pure returns (int256) {
        return pow(realArg, REAL_HALF);
    }

    /**
     * Compute the sin of a number to a certain number of Taylor series terms.
     */
    function sinLimited(int256 _realArg, int216 maxIterations) internal pure returns (int256) {
        // First bring the number into 0 to 2 pi
        // TODO: This will introduce an error for very large numbers, because the error in our Pi will compound.
        // But for actual reasonable angle values we should be fine.
        int256 realArg = _realArg;
        realArg = realArg % REAL_TWO_PI;

        int256 accumulator = REAL_ONE;

        // We sum from large to small iteration so that we can have higher powers in later terms
        for (int216 iteration = maxIterations - 1; iteration >= 0; iteration--) {
            accumulator = REAL_ONE - mul(div(mul(realArg, realArg), toReal((2 * iteration + 2) * (2 * iteration + 3))), accumulator);
            // We can't stop early; we need to make it to the first term.
        }

        return mul(realArg, accumulator);
    }

    /**
     * Calculate sin(x) with a sensible maximum iteration count to wait until
     * convergence.
     */
    function sin(int256 realArg) internal pure returns (int256) {
        return sinLimited(realArg, 15);
    }

    /**
     * Calculate cos(x).
     */
    function cos(int256 realArg) internal pure returns (int256) {
        return sin(realArg + REAL_HALF_PI);
    }

    /**
     * Calculate tan(x). May overflow for large results. May throw if tan(x)
     * would be infinite, or return an approximation, or overflow.
     */
    function tan(int256 realArg) internal pure returns (int256) {
        return div(sin(realArg), cos(realArg));
    }
}
