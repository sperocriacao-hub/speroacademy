import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const CourseIdPage = async ({
    params
}: {
    params: { courseId: string }
}) => {
    const { courseId } = params;

    const course = await db.course.findUnique({
        where: {
            id: courseId,
        },
        include: {
            modules: {
                where: {
                    isPublished: true,
                },
                orderBy: {
                    position: "asc",
                },
                include: {
                    lessons: {
                        where: {
                            isPublished: true,
                        },
                        orderBy: {
                            position: "asc",
                        }
                    }
                }
            }
        }
    });

    if (!course) {
        return redirect("/");
    }

    // Redirect to the first lesson of the first module
    const firstModule = course.modules[0];
    if (!firstModule) {
        return redirect("/");
    }

    const firstLesson = firstModule.lessons[0];
    if (!firstLesson) {
        return redirect("/");
    }

    return redirect(`/courses/${course.id}/lessons/${firstLesson.id}`);
}

export default CourseIdPage;
