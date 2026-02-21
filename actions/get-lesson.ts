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
        let isLockedByDrip = false;
        let daysUntilUnlock = 0;
        let isLockedByQuiz = false;

        if (purchase && module.unlockDays > 0) {
            const purchaseDate = new Date(purchase.createdAt);
            const unlockDate = new Date(purchaseDate.getTime() + module.unlockDays * 24 * 60 * 60 * 1000);
            const now = new Date();

            if (now < unlockDate) {
                isLockedByDrip = true;
                daysUntilUnlock = Math.ceil((unlockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            }
        }

        // --- Quiz Lock Logic ---
        if (purchase) {
            const precedingModules = await db.module.findMany({
                where: {
                    courseId: courseId,
                    position: {
                        lt: module.position
                    },
                    isPublished: true,
                },
                include: {
                    quiz: true
                }
            });

            for (const prevModule of precedingModules) {
                if (prevModule.quiz && prevModule.quiz.isPublished) {
                    const passedAttempt = await db.quizAttempt.findFirst({
                        where: {
                            userId: userId,
                            quizId: prevModule.quiz.id,
                            isPassed: true,
                        }
                    });

                    if (!passedAttempt) {
                        isLockedByQuiz = true;
                        break;
                    }
                }
            }
        }

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

        // Fetch attachments only if not locked by drip or quiz
        if (!isLockedByDrip && !isLockedByQuiz) {
            attachments = await db.attachment.findMany({
                where: {
                    courseId: courseId
                }
            });
        }

        const comments = await db.comment.findMany({
            where: {
                lessonId: lessonId,
            },
            include: {
                user: true,
            },
            orderBy: {
                createdAt: "desc",
            }
        });

        return {
            lesson,
            module,
            course,
            purchase,
            muxData: (isLockedByDrip || isLockedByQuiz) ? null : muxData,
            attachments,
            nextLesson,
            previousLesson,
            userProgress,
            comments,
            isLockedByDrip,
            daysUntilUnlock,
            isLockedByQuiz
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
            comments: [],
            isLockedByDrip: false,
            daysUntilUnlock: 0,
            isLockedByQuiz: false,
        }
    }
}
