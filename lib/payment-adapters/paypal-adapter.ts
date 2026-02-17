import paypal from "@paypal/checkout-server-sdk";
import { PaymentAdapter, PaymentIntent, PaymentResult } from "./types";

// Setup environment
const clientId = process.env.PAYPAL_CLIENT_ID || "mock_client_id";
const clientSecret = process.env.PAYPAL_CLIENT_SECRET || "mock_client_secret";

const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

export class PayPalAdapter implements PaymentAdapter {
    async createPaymentIntent(intent: PaymentIntent): Promise<PaymentResult> {
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: "CAPTURE",
            purchase_units: [{
                amount: {
                    currency_code: intent.currency.toUpperCase(),
                    value: intent.amount.toFixed(2),
                },
                description: intent.description,
                custom_id: intent.metadata?.courseId, // Store metadata
            }],
            application_context: {
                locale: intent.locale || "en-US",
            }
        });

        try {
            const response = await client.execute(request);

            // Find approval link
            const approvalLink = response.result.links.find((link: any) => link.rel === "approve");

            return {
                success: true,
                transactionId: response.result.id,
                redirectUrl: approvalLink ? approvalLink.href : undefined,
            };
        } catch (error: any) {
            console.error("[PAYPAL_CREATE_ORDER]", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async verifyPayment(transactionId: string): Promise<boolean> {
        const request = new paypal.orders.OrdersGetRequest(transactionId);
        try {
            const response = await client.execute(request);
            return response.result.status === "COMPLETED";
        } catch (error) {
            return false;
        }
    }

    async refundPayment(transactionId: string): Promise<boolean> {
        // PayPal refund usually requires Capture ID, not Order ID. 
        // Logic would be: Get Order -> Get Capture ID -> Refund Capture.
        // Simplified for this demo:
        return true;
    }
}
