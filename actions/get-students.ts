import { db } from "@/lib/db";

export const getInstructorStudents = async (userId: string) => {
    try {
        // 1. Get courses created by this instructor
        const courses = await db.course.findMany({
            where: {
                instructorId: userId,
            },
            select: {
                id: true,
                title: true,
            }
        });

        const courseIds = courses.map(c => c.id);

        // 2. Get enrollments for these courses
        const enrollments = await db.enrollment.findMany({
            where: {
                courseId: {
                    in: courseIds,
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        createdAt: true, // Use join date as proxy if needed
                    }
                },
                course: {
                    select: {
                        title: true,
                    }
                }
            }
        });

        // 3. For each enrollment, verify progress (Optional / Expensive)
        // We can do a simpler aggregation or fetch userProgress separately if needed.
        // For now, let's return the student list with the course they are in.

        // Flatten the data for the table
        const students = await Promise.all(enrollments.map(async (enrollment) => {
            // Calculate progress for this user in this course
            const publishedModules = await db.module.findMany({
                where: {
                    courseId: enrollment.courseId,
                    isPublished: true,
                },
                select: {
                    id: true,
                }
            });

            const publishedModuleIds = publishedModules.map(m => m.id);

            const publishedLessons = await db.lesson.findMany({
                where: {
                    moduleId: {
                        in: publishedModuleIds,
                    },
                    isPublished: true,
                },
                select: {
                    id: true,
                }
            });

            const lessonIds = publishedLessons.map(l => l.id);
            const validCompletedLessons = await db.userProgress.count({
                where: {
                    userId: enrollment.userId,
                    lessonId: {
                        in: lessonIds,
                    },
                    isCompleted: true,
                }
            });

            const progressPercentage = lessonIds.length === 0 ? 0 : Math.round((validCompletedLessons / lessonIds.length) * 100);

            return {
                id: enrollment.userId,
                name: enrollment.user.name || "Unknown",
                email: enrollment.user.email,
                course: enrollment.course.title,
                enrolledAt: enrollment.createdAt,
                progress: progressPercentage,
            };
        }));

        return students;

    } catch (error) {
        console.log("[GET_INSTRUCTOR_STUDENTS]", error);
        return [];
    }
};
