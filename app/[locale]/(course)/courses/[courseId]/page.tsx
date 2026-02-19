import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Clock, BookOpen, UserCircle, PlayCircle, CheckCircle2 } from "lucide-react";

import { db } from "@/lib/db";
import { CourseEnrollButton } from "./_components/course-enroll-button";
import { formatPrice } from "@/lib/format";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

const CourseIdPage = async ({
    params
}: {
    params: { courseId: string; locale: string }
}) => {
    const { courseId, locale } = params;
    const { userId } = auth();
    const t = await getTranslations("CourseSetup");

    const course = await db.course.findUnique({
        where: {
            id: courseId,
        },
        include: {
            instructor: true,
            category: true,
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

    let isEnrolled = false;
    if (userId) {
        const enrollment = await db.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId
                }
            }
        });
        isEnrolled = !!enrollment;
    }

    const firstModule = course.modules[0];
    const firstLesson = firstModule?.lessons[0];

    const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <div className="w-full bg-slate-900 text-slate-100 py-16 px-6 relative">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center gap-x-2 text-sm font-medium text-sky-400">
                            <span>{course.category?.name || "Uncategorized"}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                            {course.title}
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300">
                            {course.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-6 mt-8 text-sm text-slate-300">
                            <div className="flex items-center gap-x-2">
                                <UserCircle className="h-5 w-5" />
                                <span>{course.instructor?.name || "Instructor"}</span>
                            </div>
                            {course.workload && (
                                <div className="flex items-center gap-x-2">
                                    <Clock className="h-5 w-5" />
                                    <span>{course.workload} hours</span>
                                </div>
                            )}
                            <div className="flex items-center gap-x-2">
                                <BookOpen className="h-5 w-5" />
                                <span>{course.modules.length} Modules / {totalLessons} Lessons</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content & Sticky Card */}
            <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12 w-full mt-[-60px]">

                {/* Left Column: Details */}
                <div className="flex-1 space-y-12">

                    {/* Curriculum */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Course Curriculum</h2>
                        <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
                            {course.modules.map((module, index) => (
                                <div key={module.id} className="border-b last:border-0">
                                    <div className="bg-slate-50 p-4 font-medium flex items-center justify-between">
                                        <span>Module {index + 1}: {module.title}</span>
                                        <span className="text-sm text-slate-500 font-normal">{module.lessons.length} lessons</span>
                                    </div>
                                    <div className="p-4 flex flex-col gap-y-3">
                                        {module.lessons.map((lesson, lessonIndex) => (
                                            <div key={lesson.id} className="flex items-center gap-x-3 text-sm text-slate-700">
                                                <PlayCircle className="h-4 w-4 text-sky-700" />
                                                <span>{lesson.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Instructor Bio */}
                    {course.instructorBio && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6">About the Instructor</h2>
                            <div className="p-6 bg-slate-50 rounded-lg border text-slate-700 whitespace-pre-wrap leading-relaxed shadow-sm">
                                {course.instructorBio}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Sticky Purchasing Card */}
                <div className="w-full md:w-96">
                    <div className="bg-white rounded-xl shadow-lg border overflow-hidden md:sticky md:top-24 md:z-20">
                        <div className="aspect-video relative w-full bg-slate-200">
                            {course.thumbnail ? (
                                <Image
                                    fill
                                    className="object-cover"
                                    alt={course.title}
                                    src={course.thumbnail}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                    <PlayCircle className="h-10 w-10" />
                                </div>
                            )}
                        </div>
                        <div className="p-6 flex flex-col gap-6">
                            <div className="text-3xl font-bold text-slate-900">
                                {course.price ? formatPrice(course.price) : "Free"}
                            </div>

                            {isEnrolled ? (
                                <Link href={`/${locale}/courses/${course.id}/lessons/${firstLesson?.id}`}>
                                    <Button className="w-full" size="lg">
                                        Go to Course
                                    </Button>
                                </Link>
                            ) : (
                                course.price ? (
                                    // I should use the native enroll button logic here or just the same Stripe integration (not fully built yet)
                                    // The course-enroll-button triggers a toast "Enrollment coming soon"
                                    <CourseEnrollButton
                                        courseId={course.id}
                                        price={course.price}
                                    />
                                ) : (
                                    <Button className="w-full" size="lg">
                                        Enroll for Free
                                    </Button>
                                )
                            )}

                            <div className="flex flex-col gap-y-3 text-sm text-slate-600 mt-2">
                                <div className="flex items-center gap-x-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    <span>Lifetime access to all {totalLessons} lessons</span>
                                </div>
                                <div className="flex items-center gap-x-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    <span>Learn anywhere on your mobile or desktop</span>
                                </div>
                                <div className="flex items-center gap-x-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    <span>Downloadable resources and attachments</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default CourseIdPage;
