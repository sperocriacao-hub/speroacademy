import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
    try {
        const { userId } = auth();
        const user = await currentUser();

        if (!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        let stripeConnectId = user.privateMetadata.stripeConnectId as string | undefined;

        // If user doesn't have a connected account, create one
        if (!stripeConnectId) {
            const account = await stripe.accounts.create({
                type: "custom",
                country: "PT", // Hardcoded to PT as per request context (Europe/Portugal instructor)
                email: user.emailAddresses[0].emailAddress,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                // Add more metadata if needed
            });

            stripeConnectId = account.id;

            // Update user metadata in Clerk (or DB if synced)
            // Ideally we should update our DB user record first
            await db.user.update({
                where: { id: userId },
                data: { stripeConnectId: stripeConnectId }
            });
            // Note: Clerk metadata update requires Clerk Backend API client, skipping for now as DB is source of truth for payment flows
        }

        // Create Account Link for onboarding
        const accountLink = await stripe.accountLinks.create({
            account: stripeConnectId,
            refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/teacher/wallet`,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/teacher/wallet`,
            type: "account_onboarding",
        });

        return NextResponse.json({ url: accountLink.url });
    } catch (error) {
        console.log("[STRIPE_CONNECT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET() {
    return new NextResponse("This is a POST-only API endpoint. Please use POST to create a connected account.", { status: 200 });
}
