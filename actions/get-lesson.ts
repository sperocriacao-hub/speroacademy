import { Module, Lesson, Attachment, MuxData } from "@prisma/client";

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
        let previousLesson: Lesson | null = null;
        let attachments: Attachment[] = [];

        // --- Next Lesson Logic ---
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

        // --- Previous Lesson Logic ---
        const previousLessonInModule = await db.lesson.findFirst({
            where: {
                moduleId: module.id,
                isPublished: true,
                position: {
                    lt: lesson?.position,
                },
            },
            orderBy: {
                position: "desc",
            }
        });

        if (previousLessonInModule) {
            previousLesson = previousLessonInModule;
        } else {
            const previousModule = await db.module.findFirst({
                where: {
                    courseId: courseId,
                    isPublished: true,
                    position: {
                        lt: module?.position,
                    }
                },
                orderBy: {
                    position: "desc",
                }
            });

            if (previousModule) {
                const previousLessonInPreviousModule = await db.lesson.findFirst({
                    where: {
                        moduleId: previousModule.id,
                        isPublished: true,
                    },
                    orderBy: {
                        position: "desc",
                    }
                });
                previousLesson = previousLessonInPreviousModule;
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

        const muxData = await db.muxData.findUnique({
            where: {
                lessonId: lessonId,
            }
        });

        return {
            lesson,
            module,
            course,
            purchase,
            muxData,
            attachments,
            nextLesson,
            previousLesson,
            userProgress,
        };
    } catch (error) {
        console.log("[GET_LESSON]", error);
        return {
            lesson: null,
            module: null,
            course: null,
            purchase: null,
            muxData: null,
            attachments: [],
            nextLesson: null,
            previousLesson: null,
            userProgress: null,
        }
    }
}
