export interface PaymentIntent {
    amount: number;
    currency: string;
    description: string;
    metadata?: Record<string, string>;
    locale?: string; // For i18n support in checkout
}

export interface PaymentResult {
    success: boolean;
    transactionId?: string;
    redirectUrl?: string; // For PayPal/Klarna redirects
    error?: string;
}

export interface PaymentAdapter {
    createPaymentIntent(intent: PaymentIntent): Promise<PaymentResult>;
    verifyPayment(transactionId: string): Promise<boolean>;
    refundPayment(transactionId: string): Promise<boolean>;
}
