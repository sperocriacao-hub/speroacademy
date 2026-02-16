import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowLeft, LayoutDashboard, ListChecks } from "lucide-react";
import Link from "next/link";

import { db } from "@/lib/db";
import { ModuleTitleForm } from "./_components/module-title-form";
import { ModuleActions } from "./_components/module-actions";
import { LessonsForm } from "./_components/lessons-form";

const ModuleIdPage = async ({
    params
}: {
    params: Promise<{ courseId: string; moduleId: string }>
}) => {
    const { userId } = await auth();

    if (!userId) {
        return redirect("/");
    }

    const { courseId, moduleId } = await params;

    const courseModule = await db.module.findUnique({
        where: {
            id: moduleId,
            courseId: courseId,
        },
        include: {
            lessons: { // Renamed from chapters to lessons in my mind, but schema has Lessons.
                orderBy: {
                    position: "asc",
                }
            }
        }
    });

    if (!courseModule) {
        return redirect("/");
    }

    const requiredFields = [
        courseModule.title,
        courseModule.lessons.some(lesson => lesson.isPublished),
    ];

    const totalFields = requiredFields.length;
    const completedFields = requiredFields.filter(Boolean).length;

    const completionText = `(${completedFields}/${totalFields})`;

    const isComplete = requiredFields.every(Boolean); // Added isComplete

    return (
        <div className="p-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-y-2">
                    <Link
                        href={`/teacher/courses/${params.courseId}`}
                        className="flex items-center text-sm hover:opacity-75 transition mb-6"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to course setup
                    </Link>
                    <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col gap-y-2">
                            <h1 className="text-2xl font-medium">
                                Module Creation
                            </h1>
                            <span className="text-sm text-slate-700">
                                Complete all fields {completionText}
                            </span>
                        </div>
                        <ModuleActions
                            disabled={!isComplete}
                            courseId={params.courseId}
                            moduleId={params.moduleId}
                            isPublished={courseModule.isPublished}
                        />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
                <div className="space-y-4">
                    <div>
                        <div className="flex items-center gap-x-2">
                            <IconBadge icon={LayoutDashboard} />
                            <h2 className="text-xl">
                                Customize your module
                            </h2>
                        </div>
                        <ModuleTitleForm
                            initialData={courseModule}
                            courseId={params.courseId}
                            moduleId={params.moduleId}
                        />
                        <ModuleDescriptionForm
                            initialData={courseModule}
                            courseId={params.courseId}
                            moduleId={params.moduleId}
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-x-2">
                            <IconBadge icon={Eye} />
                            <h2 className="text-xl">
                                Access Settings
                            </h2>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-x-2">
                        <IconBadge icon={Video} />
                        <h2 className="text-xl">
                            Add a video
                        </h2>
                    </div>
                    <LessonsForm
                        initialData={courseModule}
                        courseId={params.courseId}
                        moduleId={params.moduleId}
                    />
                </div>
            </div>
        </div>
    );
}

export default ModuleIdPage;
