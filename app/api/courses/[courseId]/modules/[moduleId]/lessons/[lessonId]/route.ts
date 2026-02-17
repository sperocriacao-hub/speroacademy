import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function DELETE(
    req: Request,
    { params }: { params: { courseId: string; moduleId: string; lessonId: string } }
) {
    try {
        const { userId } = auth();
        const { courseId, moduleId, lessonId } = params;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const courseOwner = await db.course.findUnique({
            where: {
                id: courseId,
                instructorId: userId,
            }
        });

        if (!courseOwner) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const lesson = await db.lesson.findUnique({
            where: {
                id: lessonId,
                moduleId: moduleId,
            }
        });

        if (!lesson) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const deletedLesson = await db.lesson.delete({
            where: {
                id: lessonId,
            }
        });

        const publishedLessonsInModule = await db.lesson.findMany({
            where: {
                moduleId: moduleId,
                isPublished: true,
            }
        });

        if (!publishedLessonsInModule.length) {
            await db.module.update({
                where: {
                    id: moduleId,
                },
                data: {
                    isPublished: false,
                }
            });
        }

        return NextResponse.json(deletedLesson);

    } catch (error) {
        console.log("[LESSON_ID_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { courseId: string; moduleId: string; lessonId: string } }
) {
    try {
        const { userId } = auth();
        const { courseId, moduleId, lessonId } = params;
        const { isPublished, ...values } = await req.json();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const courseOwner = await db.course.findUnique({
            where: {
                id: courseId,
                instructorId: userId,
            }
        });

        if (!courseOwner) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const lesson = await db.lesson.update({
            where: {
                id: lessonId,
                moduleId: moduleId,
            },
            data: {
                ...values,
            }
        });

        return NextResponse.json(lesson);
    } catch (error) {
        console.log("[LESSON_ID]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
