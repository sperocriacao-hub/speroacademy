import { getExchangeRate, convertAmount } from "./currency";

interface SplitResult {
    platformShare: number;
    instructorShare: number;
    currency: string;
    exchangeRateUsed: number;
    originalAmount: number;
    originalCurrency: string;
}

interface SplitOptions {
    amount: number;
    currency: string; // The currency the user paid in
    targetCurrency?: string; // The currency needed for payout (usually platform default)
    platformFeePercentage: number; // e.g. 10 for 10%
    instructorFeePercentage?: number; // Optional override, otherwise remainder
}

/**
 * Calculates the commission split for a transaction.
 * Supports handling Multi-currency via getExchangeRate.
 */
export const calculateSplit = async ({
    amount,
    currency,
    targetCurrency = "USD", // Assuming platform runs on USD or BRL
    platformFeePercentage,
}: SplitOptions): Promise<SplitResult> => {

    // 1. Get Exchange Rate
    const rate = await getExchangeRate(currency, targetCurrency);

    // 2. Convert Total to Target Currency (for standardization in DB)
    const convertedTotal = convertAmount(amount, rate);

    // 3. Calculate Platform Fee
    const platformShare = Number((convertedTotal * (platformFeePercentage / 100)).toFixed(2));

    // 4. Calculate Instructor Share (Remainder)
    const instructorShare = Number((convertedTotal - platformShare).toFixed(2));

    return {
        platformShare,
        instructorShare,
        currency: targetCurrency,
        exchangeRateUsed: rate,
        originalAmount: amount,
        originalCurrency: currency,
    };
};
