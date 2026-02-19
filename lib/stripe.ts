import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_API_KEY || "sk_test_mock", {
    apiVersion: "2026-01-28.clover" as any,
    typescript: true,
});
