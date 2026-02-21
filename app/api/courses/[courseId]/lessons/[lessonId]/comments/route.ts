import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function POST(
    req: Request,
    { params }: { params: { courseId: string; lessonId: string } }
) {
    try {
        const { userId } = auth();
        const { text } = await req.json();
        const { courseId, lessonId } = await params;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const courseOwner = await db.course.findUnique({
            where: {
                id: courseId,
                isPublished: true,
            }
        });

        if (!courseOwner) {
            return new NextResponse("Not found", { status: 404 });
        }

        const comment = await db.comment.create({
            data: {
                text,
                lessonId: lessonId,
                userId: userId,
            }
        });

        return NextResponse.json(comment);

    } catch (error) {
        console.log("[COMMENT_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
