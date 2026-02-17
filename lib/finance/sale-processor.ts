
import { db } from "@/lib/db";

interface SaleConfig {
    platformFeePercent?: number; // default 15%
}

interface SaleRequest {
    courseId: string;
    studentId: string;
    instructorId: string;
    amount: number;
    currency: string;
    paymentMethod: "STRIPE" | "PAYPAL" | "MBWAY" | "KLARNA";
    paymentId?: string;
}

const GATEWAY_FEES = {
    // Example fees, should be properly configured
    "PAYPAL": { rate: 0.029, fixed: 0.30 },
    "KLARNA": { rate: 0.029, fixed: 0.30 }, // Assuming similar to PayPal/Stripe for now
    "STRIPE": { rate: 0.029, fixed: 0.30 },
    "MBWAY": { rate: 0.015, fixed: 0.10 }, // Example
};

export const processCourseSale = async (
    request: SaleRequest,
    config?: SaleConfig
) => {
    const {
        courseId,
        studentId,
        instructorId,
        amount,
        currency,
        paymentMethod,
        paymentId
    } = request;

    const platformFeePercent = config?.platformFeePercent || 15;

    // 1. Calculate Deductions
    let operationalFee = 0;
    const gateway = GATEWAY_FEES[paymentMethod] || { rate: 0, fixed: 0 };

    // "Se o pagamento for via Klarna ou PayPal, subtrai primeiro a taxa operacional"
    if (["PAYPAL", "KLARNA"].includes(paymentMethod)) {
        operationalFee = (amount * gateway.rate) + gateway.fixed;
    }

    const netAmount = Math.max(0, amount - operationalFee);

    // 2. Split (Platform retains 15%)
    const platformShare = Math.round((netAmount * (platformFeePercent / 100)) * 100) / 100;
    const instructorShare = Math.round((netAmount - platformShare) * 100) / 100;

    // 3. Create Transaction Record
    const transaction = await db.transaction.create({
        data: {
            userId: studentId,
            courseId: courseId,
            instructorId: instructorId,
            amount,
            currency,
            platformFeePercent: Number(platformFeePercent),
            platformShare, // This actually includes the operational fee implicitly if we are strictly following "Platform Retains 15% of Net"
            // Wait, usually Platform Fee is calculated on GROSS, but user said "subtrai primeiro a taxa operacional... e DEPOIS divide"
            // So: Net = Gross - Gateway. Platform = Net * 15%. Instructor = Net - Platform.
            // But where does the Gateway Fee go in the DB? 
            // The prompt says "valor_comissao_plataforma", "valor_liquido_formador".
            // It doesn't ask to store "gateway_fee". 
            // So "platformShare" here will be strictly the Platform's revenue from the Net. 
            // The sum (platformShare + instructorShare) = Net Amount != Gross Amount.
            // This is correct as per request.

            instructorShare,
            paymentMethod,
            stripePaymentId: paymentId,
            status: "COMPLETED"
        }
    });

    // 4. Update Wallet
    await db.wallet.upsert({
        where: {
            instructorId: instructorId,
        },
        create: {
            instructorId: instructorId,
            balance: instructorShare,
            currency: currency, // Assuming single currency for now or simple sum
        },
        update: {
            balance: {
                increment: instructorShare
            }
        }
    });

    return transaction;
};
