import { db } from "@/lib/db";

export const getProgress = async (
    userId: string,
    courseId: string,
): Promise<number> => {
    try {
        const publishedChapters = await db.module.findMany({ // Modules are the main units
            where: {
                courseId: courseId,
                isPublished: true,
            },
            select: {
                id: true,
            }
        });

        const publishedChapterIds = publishedChapters.map((chapter) => chapter.id);

        // If we want to track progress by LESSONS (which makes more sense), we should fetch lessons.
        // For now, let's assume progress is based on LESSONS completed across all modules.

        // Fetch all published lessons in published modules
        const publishedLessons = await db.lesson.findMany({
            where: {
                moduleId: {
                    in: publishedChapterIds
                },
                isPublished: true,
            },
            select: {
                id: true,
            }
        });

        const publishedLessonIds = publishedLessons.map((lesson) => lesson.id);

        const validCompletedLessons = await db.userProgress.count({
            where: {
                userId: userId,
                lessonId: {
                    in: publishedLessonIds,
                },
                isCompleted: true,
            }
        });

        const progressPercentage = publishedLessonIds.length === 0 ? 0 : (validCompletedLessons / publishedLessonIds.length) * 100;

        return progressPercentage;
    } catch (error) {
        console.log("[GET_PROGRESS]", error);
        return 0;
    }
}
