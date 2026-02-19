import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CircleDollarSign, File, LayoutDashboard, ListChecks } from "lucide-react";

import { db } from "@/lib/db";
import { TitleForm } from "./_components/title-form";
import { DescriptionForm } from "./_components/description-form";
import { ImageForm } from "./_components/image-form";
import { CategoryForm } from "./_components/category-form";
import { PriceForm } from "./_components/price-form";
import { AttachmentForm } from "./_components/attachment-form";
import { ModulesForm } from "./_components/modules-form";
import { Banner } from "@/components/banner";
import { Actions } from "./_components/actions";
import { Progress } from "@/components/ui/progress";

const CourseIdPage = async ({
    params
}: {
    params: { courseId: string }
}) => {
    const { userId } = auth();

    if (!userId) {
        return redirect("/");
    }

    const { courseId } = params;

    const course = await db.course.findUnique({
        where: {
            id: courseId,
        },
        include: {
            modules: {
                orderBy: {
                    position: "asc",
                },
            },
            attachments: {
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    });

    const categories = await db.category.findMany({
        orderBy: {
            name: "asc",
        },
    });

    if (!course || course.instructorId !== userId) {
        return redirect("/");
    }

    const requiredFields = [
        course.title,
        course.description,
        course.thumbnail,
        course.price,
        course.categoryId,
        course.modules.some(module => module.isPublished),
    ];

    const totalFields = requiredFields.length;
    const completedFields = requiredFields.filter(Boolean).length;

    const completionText = `(${completedFields}/${totalFields})`;

    const isComplete = requiredFields.every(Boolean);

    return (
        <>
            {!course.isPublished && (
                <Banner
                    label="This course is unpublished. It will not be visible to the students."
                />
            )}
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-y-2">
                        <h1 className="text-2xl font-medium">
                            Course Setup
                        </h1>
                        <span className="text-sm text-slate-700">
                            Complete all fields {completionText}
                        </span>
                        {/* Add Visual Progress Bar here if desired, or keep clear text */}
                    </div>
                    <Actions
                        disabled={!isComplete}
                        courseId={course.id}
                        isPublished={course.isPublished}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
                    <div>
                        <div className="flex items-center gap-x-2">
                            {/* Icon Badge Logic could be extracted */}
                            <div className="rounded-full flex items-center justify-center bg-sky-100 p-2">
                                <LayoutDashboard className="h-5 w-5 text-sky-700" />
                            </div>
                            <h2 className="text-xl font-medium">
                                Customize your course
                            </h2>
                        </div>
                        <TitleForm
                            initialData={course}
                            courseId={course.id}
                        />
                        <DescriptionForm
                            initialData={course}
                            courseId={course.id}
                        />
                        <ImageForm
                            initialData={course}
                            courseId={course.id}
                        />
                        <CategoryForm
                            initialData={course}
                            courseId={course.id}
                            options={categories.map((category) => ({
                                label: category.name,
                                value: category.id,
                            }))}
                        />
                    </div>
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-x-2">
                                <div className="rounded-full flex items-center justify-center bg-sky-100 p-2">
                                    <ListChecks className="h-5 w-5 text-sky-700" />
                                </div>
                                <h2 className="text-xl font-medium">
                                    Course modules
                                </h2>
                            </div>
                            <ModulesForm
                                initialData={course}
                                courseId={course.id}
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-x-2">
                                <div className="rounded-full flex items-center justify-center bg-sky-100 p-2">
                                    <CircleDollarSign className="h-5 w-5 text-sky-700" />
                                </div>
                                <h2 className="text-xl font-medium">
                                    Sell your course
                                </h2>
                            </div>
                            <PriceForm
                                initialData={course}
                                courseId={course.id}
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-x-2">
                                <div className="rounded-full flex items-center justify-center bg-sky-100 p-2">
                                    <File className="h-5 w-5 text-sky-700" />
                                </div>
                                <h2 className="text-xl font-medium">
                                    Resources & Attachments
                                </h2>
                            </div>
                            <AttachmentForm
                                initialData={course}
                                courseId={course.id}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CourseIdPage;
