import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ courseId: string; moduleId: string; lessonId: string }> }
) {
    try {
        const { userId } = await auth();
        const { isCompleted } = await req.json();
        const { courseId, moduleId } = await params;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { lessonId: paramLessonId } = await params;

        const userProgress = await db.userProgress.upsert({
            where: {
                userId_lessonId: {
                    userId,
                    lessonId: paramLessonId,
                }
            },
            update: {
                isCompleted,
            },
            create: {
                userId,
                lessonId: paramLessonId,
                isCompleted,
            }
        })

        return NextResponse.json(userProgress);
    } catch (error) {
        console.log("[LESSON_ID_PROGRESS]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
