import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function PUT(
    req: Request,
    { params }: { params: { courseId: string; moduleId: string; lessonId: string } }
) {
    try {
        const { userId } = auth();
        const { isCompleted } = await req.json();
        const { courseId, moduleId } = params;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { lessonId: paramLessonId } = params;

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
        });

        // 50% completion automated trigger
        if (isCompleted) {
            const publishedLessonsCourse = await db.lesson.findMany({
                where: {
                    module: {
                        courseId: courseId,
                    },
                    isPublished: true,
                },
                select: {
                    id: true,
                }
            });

            const publishedLessonIds = publishedLessonsCourse.map(lesson => lesson.id);

            const completedLessons = await db.userProgress.count({
                where: {
                    userId,
                    lessonId: {
                        in: publishedLessonIds,
                    },
                    isCompleted: true,
                }
            });

            const totalLessons = publishedLessonIds.length;
            const threshold = Math.ceil(totalLessons / 2);

            if (completedLessons === threshold && totalLessons > 0) {
                // Orchestration webhook trigger
                console.log(`[WEBHOOK TRIGGER] User ${userId} reached 50% completion on course ${courseId}. Dispatch congratulatory email.`);
                // Here you would implement your HTTP request to Resend/SendGrid or Zapier
                // await axios.post(process.env.AUTOMATION_WEBHOOK_URL, { userId, courseId });
            }
        }

        return NextResponse.json(userProgress);
    } catch (error) {
        console.log("[LESSON_ID_PROGRESS]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
