import { auth } from "@clerk/nextjs/server";
import { Module, Lesson, Course, UserProgress } from "@prisma/client";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { CourseSidebarItem } from "./course-sidebar-item";
import { CourseProgress } from "@/components/course-progress";

interface CourseSidebarProps {
    course: Course & {
        modules: (Module & {
            lessons: (Lesson & {
                userProgress: UserProgress[] | null;
            })[];
        })[];
    };
    progressCount: number;
};

export const CourseSidebar = async ({
    course,
    progressCount,
}: CourseSidebarProps) => {
    const { userId } = await auth();

    if (!userId) {
        return redirect("/");
    }

    const purchase = await db.purchase.findUnique({
        where: {
            userId_courseId: {
                userId,
                courseId: course.id,
            }
        }
    });

    return (
        <div className="h-full border-r border-slate-800 bg-slate-900 flex flex-col overflow-y-auto">
            <div className="p-6 flex flex-col border-b border-slate-800">
                <h1 className="font-semibold text-white tracking-tight text-lg line-clamp-2">
                    {course.title}
                </h1>
                {purchase && (
                    <div className="mt-4">
                        <CourseProgress
                            variant="success"
                            value={progressCount}
                        />
                    </div>
                )}
            </div>
            <div className="flex flex-col w-full pb-20">
                {course.modules.map((module) => (
                    <div key={module.id} className="flex flex-col border-b border-slate-800 last:border-0">
                        <div className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-slate-400 bg-slate-950/50 sticky top-0 z-10 backdrop-blur-sm">
                            {module.title}
                        </div>
                        <div className="flex flex-col">
                            {module.lessons.map((lesson) => (
                                <CourseSidebarItem
                                    key={lesson.id}
                                    id={lesson.id}
                                    label={lesson.title}
                                    isCompleted={!!lesson.userProgress?.[0]?.isCompleted}
                                    courseId={course.id}
                                    moduleId={module.id}
                                    isLocked={!lesson.isFree && !purchase}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
