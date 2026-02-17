import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
    try {
        const { userId } = auth();
        const user = await currentUser();

        if (!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { courseId } = await req.json();

        const course = await db.course.findUnique({
            where: { id: courseId },
            include: {
                instructor: true, // Need to get instructor's stripe connect ID
            }
        });

        if (!course) {
            return new NextResponse("Not Found", { status: 404 });
        }

        if (!course.price) {
            return new NextResponse("No price", { status: 400 });
        }

        if (!course.instructor.stripeConnectId) {
            return new NextResponse("Instructor not configured for payments", { status: 400 });
        }

        const purchase = await db.purchase.findUnique({
            where: {
                userId_courseId: {
                    userId: userId,
                    courseId: courseId
                }
            }
        });

        if (purchase) {
            return new NextResponse("Already purchased", { status: 400 });
        }

        // Get System Settings for Fee
        const settings = await db.systemSettings.findFirst();
        const platformFeePercent = settings?.platformFeePercent || 15; // User asked for 15% explicit in prompt 3, or dynamic.

        // Calculate Application Fee (Platform Share)
        // Stripe expects integers (cents)
        const priceInCents = Math.round(course.price * 100);
        const applicationFeeAmount = Math.round(priceInCents * (platformFeePercent / 100));

        const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
            {
                quantity: 1,
                price_data: {
                    currency: "BRL", // Course is sold in BRL as per prompt
                    product_data: {
                        name: course.title,
                        description: course.description!,
                    },
                    unit_amount: priceInCents,
                }
            }
        ];

        let stripeCustomer = await db.user.findUnique({
            where: { id: userId },
            select: { stripeConnectId: true } // Reusing this field? No, customer ID is different usually.
            // For now, let Stripe create guest or new customer on checkout if we don't track customer IDs separately.
        });

        // Use Stripe Connect Destination Charge or Separate Charge and Transfer?
        // "Direct Charge" is best for standard Connect but "Destination Charge" (on platform) is easier for maintaining control.
        // Prompt implies "Marketplace model", usually Destination Charge.
        // flow: Platform receives money -> takes fee -> sends rest to connected account.

        const session = await stripe.checkout.sessions.create({
            customer_email: user.emailAddresses[0].emailAddress,
            line_items,
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?success=1`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?canceled=1`,
            payment_intent_data: {
                application_fee_amount: applicationFeeAmount,
                transfer_data: {
                    destination: course.instructor.stripeConnectId,
                },
            },
            metadata: {
                courseId: course.id,
                userId: userId,
                instructorId: course.instructorId,
            }
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.log("[STRIPE_CHECKOUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET() {
    return new NextResponse("This is a POST-only API endpoint. Please use POST to create a checkout session.", { status: 200 });
}
