import Stripe from "stripe";
import { PaymentAdapter, PaymentIntent, PaymentResult } from "./types";

if (!process.env.STRIPE_API_KEY) {
    console.warn("STRIPE_API_KEY is missing in environment variables.");
}

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
    apiVersion: "2024-10-28.acacia", // Use latest or pinned version
    typescript: true,
});

export class StripeAdapter implements PaymentAdapter {
    async createPaymentIntent(intent: PaymentIntent): Promise<PaymentResult> {
        try {
            // Map our generic intent to Stripe's PaymentIntent
            const stripeIntent = await stripe.paymentIntents.create({
                amount: Math.round(intent.amount * 100), // Stripe uses cents
                currency: intent.currency.toLowerCase(),
                description: intent.description,
                metadata: intent.metadata,
                automatic_payment_methods: {
                    enabled: true, // Enables Cards, Klarna, MBWAY if configured in Stripe Dashboard
                },
            });

            return {
                success: true,
                transactionId: stripeIntent.id,
                // In a real client-side flow, we'd pass the client_secret to the frontend elements
                // For a redirect flow (like pure checkout), we might use stripe.checkout.sessions
            };
        } catch (error: any) {
            console.error("[STRIPE_CREATE_INTENT]", error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    async verifyPayment(transactionId: string): Promise<boolean> {
        try {
            const intent = await stripe.paymentIntents.retrieve(transactionId);
            return intent.status === "succeeded";
        } catch (error) {
            return false;
        }
    }

    async refundPayment(transactionId: string): Promise<boolean> {
        try {
            const refund = await stripe.refunds.create({
                payment_intent: transactionId,
            });
            return refund.status === "succeeded";
        } catch (error) {
            return false;
        }
    }
}
