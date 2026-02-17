import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Mux from "@mux/mux-node";

import { db } from "@/lib/db";

const { video } = new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST(
    req: Request,
    { params }: { params: { courseId: string; moduleId: string; lessonId: string } }
) {
    try {
        const { userId } = auth();
        const { courseId, moduleId, lessonId } = params;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const courseOwner = await db.course.findUnique({
            where: {
                id: courseId,
                instructorId: userId,
            }
        });

        if (!courseOwner) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const upload = await video.uploads.create({
            new_asset_settings: {
                playback_policy: ["public"],
                input: [
                    {
                        url: "https://your-site.com/logo.png", // Optional: Add watermark or intros later
                        // type: "image", 
                    }
                ],
            },
            cors_origin: "*", // Adjust in production
        });

        return NextResponse.json(upload);

    } catch (error) {
        console.log("[LESSON_ID_MUX_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { courseId: string; moduleId: string; lessonId: string } }
) {
    try {
        const { userId } = auth();
        const { courseId, moduleId, lessonId } = params;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const courseOwner = await db.course.findUnique({
            where: {
                id: courseId,
                instructorId: userId,
            }
        });

        if (!courseOwner) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const muxData = await db.muxData.findUnique({
            where: {
                lessonId,
            }
        });

        if (muxData) {
            await video.assets.delete(muxData.assetId);
            await db.muxData.delete({
                where: {
                    id: muxData.id,
                }
            });
        }

        return new NextResponse("Deleted", { status: 200 });

    } catch (error) {
        console.log("[LESSON_ID_MUX_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
