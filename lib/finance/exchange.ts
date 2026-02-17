import axios from "axios";

const API_KEY = process.env.EXCHANGE_RATE_API_KEY;
// If no key is provided, we can use a fallback or mock.
// For testing without key, we will use a static rate.

export const convertCurrency = async (
    amount: number,
    from: string,
    to: string
): Promise<number> => {
    if (from === to) return amount;

    try {
        if (!API_KEY) {
            console.warn("EXCHANGE_RATE_API_KEY is missing. Using mock rates.");
            // Mock rates (approximate as of late 2024/early 2025)
            const mockRates: Record<string, number> = {
                "BRL_EUR": 0.16, // 1 BRL = 0.16 EUR
                "USD_EUR": 0.92,
                "EUR_BRL": 6.25,
            };
            const rate = mockRates[`${from}_${to}`] || 1;
            return amount * rate;
        }

        const response = await axios.get(
            `https://v6.exchangerate-api.com/v6/${API_KEY}/pair/${from}/${to}/${amount}`
        );

        if (response.data && response.data.conversion_result) {
            return response.data.conversion_result;
        }

        return amount;
    } catch (error) {
        console.error("[CURRENCY_CONVERSION_ERROR]", error);
        return amount; // Fallback to original amount if conversion fails (UI should handle displaying diff symbol maybe?)
    }
};

export const getExchangeRate = async (from: string, to: string): Promise<number> => {
    if (from === to) return 1;
    // Helper to get just the rate if needed for computations
    // reusing the logic above for simplicity
    const converted = await convertCurrency(1, from, to);
    return converted;
}
