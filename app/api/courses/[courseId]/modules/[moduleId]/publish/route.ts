import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
    try {
        const { userId } = await auth();
        const { courseId, moduleId } = await params;

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

        const courseModule = await db.module.findUnique({
            where: {
                id: moduleId,
                courseId: courseId,
            },
            include: {
                lessons: true,
            }
        });

        if (!courseModule) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const hasPublishedLessons = courseModule.lessons.length > 0;

        // Usually you check validation here, e.g. does it have published lessons?
        // For now, just allow publishing.

        if (!hasPublishedLessons || !courseModule.title) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const publishedModule = await db.module.update({
            where: {
                id: moduleId,
                courseId: courseId,
            },
            data: {
                isPublished: true,
            }
        });

        return NextResponse.json(publishedModule);
    } catch (error) {
        console.log("[MODULE_PUBLISH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
