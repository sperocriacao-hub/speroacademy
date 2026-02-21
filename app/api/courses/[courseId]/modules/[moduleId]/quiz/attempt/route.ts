import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

interface Option {
    id: string;
    text: string;
    isCorrect: boolean;
}

export async function POST(
    req: Request,
    { params }: { params: { courseId: string; moduleId: string; } }
) {
    try {
        const { userId } = auth();
        const { courseId, moduleId } = params;
        const { answers } = await req.json(); // Record<questionId, optionId>

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Verify enrollment
        const purchase = await db.purchase.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                }
            }
        });

        if (!purchase) {
            return new NextResponse("Unauthorized - Purchase required", { status: 401 });
        }

        const quiz = await db.quiz.findUnique({
            where: {
                moduleId: moduleId
            },
            include: {
                questions: true,
            }
        });

        if (!quiz) {
            return new NextResponse("Not Found", { status: 404 });
        }

        // Calculate score
        let correctAnswers = 0;
        const totalQuestions = quiz.questions.length;

        if (totalQuestions === 0) {
            return new NextResponse("Quiz is empty", { status: 400 });
        }

        for (const question of quiz.questions) {
            const selectedOptionId = answers[question.id];
            const options = (question.options as unknown as Option[]) || [];

            const selectedOption = options.find((opt: Option) => opt.id === selectedOptionId);

            if (selectedOption && selectedOption.isCorrect) {
                correctAnswers += 1;
            }
        }

        const scorePercentage = (correctAnswers / totalQuestions) * 100;
        const PASS_THRESHOLD = 70.0;
        const isPassed = scorePercentage >= PASS_THRESHOLD;

        // Save Attempt to Database
        const attempt = await db.quizAttempt.create({
            data: {
                score: scorePercentage,
                isPassed,
                userId,
                quizId: quiz.id,
            }
        });

        return NextResponse.json(attempt);

    } catch (error) {
        console.log("[QUIZ_ATTEMPT_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
