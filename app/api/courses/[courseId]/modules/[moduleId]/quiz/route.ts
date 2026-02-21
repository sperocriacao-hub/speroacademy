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

        const quiz = await db.quiz.create({
            data: {
                title,
                moduleId: moduleId,
            }
        });

        return NextResponse.json(quiz);

    } catch (error) {
        console.log("[QUIZ_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
