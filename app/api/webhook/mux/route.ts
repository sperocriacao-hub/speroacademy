import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Mux from "@mux/mux-node";

import { db } from "@/lib/db";

const { video } = new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST(req: Request) {
    const body = await req.json();
    const headerPayload = headers();
    const signature = headerPayload.get("mux-signature");

    if (!signature) {
        return new NextResponse("Missing Mux Signature", { status: 401 });
    }

    // Verify signature if webhook secret is set
    // if (process.env.MUX_WEBHOOK_SECRET) {
    //   try {
    //     Mux.Webhooks.verifyHeader(
    //         JSON.stringify(body),
    //         signature,
    //         process.env.MUX_WEBHOOK_SECRET
    //     );
    //   } catch (err) {
    //       return new NextResponse("Invalid Signature", { status: 401 });
    //   }
    // }

    const event = body;

    if (event.type === "video.asset.created") {
        // Just logging, nothing to do yet usually
    }

    if (event.type === "video.asset.ready") {
        const data = event.data;
        const playbackId = data.playback_ids?.[0]?.id;

        if (!playbackId) return new NextResponse("Missing Playback ID", { status: 400 });

        // The passthrough field contains our lessonId
        const lessonId = data.passthrough;

        if (lessonId) {
            try {
                // Update the lesson to be published automatically upon successful processing
                await db.lesson.update({
                    where: { id: lessonId },
                    data: { isPublished: true }
                });
                console.log(`[MUX WEBHOOK] Auto-published lesson: ${lessonId}`);
            } catch (error) {
                console.error("[MUX WEBHOOK ERROR] Failed to publish lesson:", error);
                // Return 200 anyway so Mux doesn't keep retrying if the lesson was deleted
            }
        }
    }

    return new NextResponse("OK", { status: 200 });
}
