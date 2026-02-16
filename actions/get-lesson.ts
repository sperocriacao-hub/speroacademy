import { Module, Lesson, Attachment } from "@prisma/client";

import { db } from "@/lib/db";

interface GetLessonProps {
    userId: string;
    courseId: string;
    lessonId: string;
};

export const getLesson = async ({
    userId,
    courseId,
    lessonId,
}: GetLessonProps) => {
    try {
        const purchase = await db.purchase.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                }
            }
        });

        const course = await db.course.findUnique({
            where: {
                isPublished: true,
                id: courseId,
            },
            select: {
                price: true,
            }
        });

        const lesson = await db.lesson.findUnique({
            where: {
                id: lessonId,
                isPublished: true,
            }
        });

        if (!lesson || !course) {
            throw new Error("Lesson or course not found");
        }

        const module = await db.module.findUnique({
            where: {
                id: lesson.moduleId,
                isPublished: true,
            }
        });

        if (!module) {
            throw new Error("Module not found");
        }

        let nextLesson: Lesson | null = null;
        let attachments: Attachment[] = [];

        const nextLessonInModule = await db.lesson.findFirst({
            where: {
                moduleId: module.id,
                isPublished: true,
                position: {
                    gt: lesson?.position,
                },
            },
            orderBy: {
                position: "asc",
            }
        });

        if (nextLessonInModule) {
            nextLesson = nextLessonInModule;
        } else {
            const nextModule = await db.module.findFirst({
                where: {
                    courseId: courseId,
                    isPublished: true,
                    position: {
                        gt: module?.position,
                    }
                },
                orderBy: {
                    position: "asc",
                }
            });

            if (nextModule) {
                const nextLessonInNextModule = await db.lesson.findFirst({
                    where: {
                        moduleId: nextModule.id,
                        isPublished: true,
                    },
                    orderBy: {
                        position: "asc",
                    }
                });
                nextLesson = nextLessonInNextModule;
            }
        }

        const userProgress = await db.userProgress.findUnique({
            where: {
                userId_lessonId: {
                    userId,
                    lessonId,
                }
            }
        });

        return {
            lesson,
            module,
            course,
            purchase,
            attachments,
            nextLesson,
            userProgress,
        };
    } catch (error) {
        console.log("[GET_LESSON]", error);
        return {
            lesson: null,
            module: null,
            course: null,
            purchase: null,
            attachments: [],
            nextLesson: null,
            userProgress: null,
        }
    }
}
