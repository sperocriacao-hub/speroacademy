import axios from "axios";

// Cache for exchange rates to avoid spamming the API
let rateCache: { [key: string]: number } = {};
let lastFetch = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export const getExchangeRate = async (from: string, to: string): Promise<number> => {
    if (from === to) return 1;

    const now = Date.now();
    const cacheKey = `${from}_${to}`;

    if (rateCache[cacheKey] && now - lastFetch < CACHE_TTL) {
        return rateCache[cacheKey];
    }

    try {
        // Using a public free API for demonstration. In production, use a paid service like Fixer.io or OpenExchangeRates
        // and store API keys in .env
        const response = await axios.get(`https://open.er-api.com/v6/latest/${from}`);

        if (response.data && response.data.rates) {
            lastFetch = now;
            // Update cache for this base currency
            Object.keys(response.data.rates).forEach(currency => {
                const key = `${from}_${currency}`;
                rateCache[key] = response.data.rates[currency];
            });

            return response.data.rates[to] || 1;
        }

        return 1;
    } catch (error) {
        console.error("[EXCHANGE_RATE_ERROR]", error);
        // Fallback to 1 if API fails, or throw error depending on strictness required
        return 1;
    }
};

export const convertAmount = (amount: number, rate: number): number => {
    return Number((amount * rate).toFixed(2));
};
