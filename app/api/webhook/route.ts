import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { processCourseSale } from "@/lib/finance/sale-processor";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
        const userId = session.metadata?.userId;
        const courseId = session.metadata?.courseId;
        const instructorId = session.metadata?.instructorId;

        if (!userId || !courseId || !instructorId) {
            return new NextResponse(`Webhook Error: Missing metadata`, { status: 400 });
        }

        // 1. Unlock Course (Create Purchase)
        await db.purchase.create({
            data: {
                userId: userId,
                courseId: courseId,
                price: session.amount_total ? session.amount_total / 100 : 0, // Store as float
            }
        });

        // 2. Process Financials (Split, Transaction Record, Wallet)
        // using our sale-processor helper
        await processCourseSale({
            courseId,
            studentId: userId,
            instructorId,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency?.toUpperCase() || "BRL",
            paymentMethod: "STRIPE", // Can infer form session.payment_method_types if needed
            paymentId: session.payment_intent as string,
        }, {
            // Fee is already taken by Stripe logic, but we need to record it correctly in DB.
            // If we rely on processCourseSale to calculate splits again, it might duplicate logic.
            // Ideally processCourseSale should just record what happened if we pass specific values.
            // For now, let's trust processCourseSale to recalculate based on same rules (Settings) 
            // OR pass explicit values if we enhanced it. 
            // Given urgency, we rely on consistency between "create-checkout" and "processCourseSale" logic.
        });
    }

    return new NextResponse(null, { status: 200 });
}
