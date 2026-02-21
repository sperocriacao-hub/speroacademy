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
        const { prompt } = await req.json();

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

        const quiz = await db.quiz.findUnique({
            where: {
                moduleId: moduleId
            }
        });

        if (!quiz) {
            return new NextResponse("Quiz Not Found", { status: 404 });
        }

        const lastQuestion = await db.question.findFirst({
            where: {
                quizId: quiz.id,
            },
            orderBy: {
                position: "desc",
            }
        });

        const newPosition = lastQuestion ? lastQuestion.position + 1 : 1;

        const question = await db.question.create({
            data: {
                prompt,
                quizId: quiz.id,
                position: newPosition,
                options: [], // Initialize with empty options
            }
        });

        return NextResponse.json(question);

    } catch (error) {
        console.log("[QUESTIONS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
