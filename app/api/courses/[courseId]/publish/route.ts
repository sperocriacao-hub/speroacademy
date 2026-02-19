import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function PATCH(
    req: Request,
    { params }: { params: { courseId: string } }
) {
    try {
        const { userId } = auth();
        const { courseId } = params;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const course = await db.course.findUnique({
            where: {
                id: courseId,
                instructorId: userId,
            },
            include: {
                modules: true,
            }
        });

        if (!course) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const hasPublishedModules = course.modules.some((module) => module.isPublished);

        if (!course.title || !course.description || !course.thumbnail || !course.categoryId || !hasPublishedModules) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const publishedCourse = await db.course.update({
            where: {
                id: courseId,
                instructorId: userId,
            },
            data: {
                isPublished: true,
            }
        });

        return NextResponse.json(publishedCourse);
    } catch (error) {
        console.log("[COURSE_PUBLISH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
