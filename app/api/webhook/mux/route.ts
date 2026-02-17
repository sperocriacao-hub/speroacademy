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

        // We need to find which lesson this upload belongs to.
        // Usually we pass 'passthrough' data during upload creation.
        // For now, let's assume we can match by assetId if we saved it pending, 
        // OR we rely on the passthrough field. 
        // Since my upload route didn't set passthrough, I need to update it.

        // STRATEGY CHANGE: 
        // The Upload Route should create the MuxData record immediately with the uploadId or wait?
        // Better: The client uploads. On success, the client calls our API to say "I finished upload X".
        // Then we poll or wait for webhook. 
        // 
        // Alternative: We use the 'passthrough' field in Mux to store the LessonId.
    }

    // Implementation note: 
    // To verify this properly, I need to update the Upload Route to include 'passthrough: lessonId'.
    // Then here I can read 'event.data.passthrough' to identify the lesson.

    return new NextResponse("OK", { status: 200 });
}
