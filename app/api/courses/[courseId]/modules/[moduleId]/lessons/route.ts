import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function POST(
    req: Request,
    { params }: { params: { courseId: string; moduleId: string } }
) {
    try {
        const { userId } = auth();
        const { courseId, moduleId } = params;
        const { title } = await req.json();

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
            }
        });

        if (!courseModule) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const lastLesson = await db.lesson.findFirst({
            where: {
                moduleId: moduleId,
            },
            orderBy: {
                position: "desc",
            },
        });

        const newPosition = lastLesson ? lastLesson.position + 1 : 1;

        const lesson = await db.lesson.create({
            data: {
                title,
                moduleId: moduleId,
                position: newPosition,
            },
        });

        return NextResponse.json(lesson);
    } catch (error) {
        console.log("[LESSONS]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
