import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function DELETE(
    req: Request,
    { params }: { params: { courseId: string; moduleId: string; questionId: string; } }
) {
    try {
        const { userId } = auth();
        const { courseId, moduleId, questionId } = params;

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

        const question = await db.question.findUnique({
            where: {
                id: questionId
            }
        });

        if (!question) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const deletedQuestion = await db.question.delete({
            where: {
                id: questionId,
            }
        });

        return NextResponse.json(deletedQuestion);

    } catch (error) {
        console.log("[QUESTION_ID_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { courseId: string; moduleId: string; questionId: string; } }
) {
    try {
        const { userId } = auth();
        const { courseId, moduleId, questionId } = params;
        const values = await req.json();

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

        const question = await db.question.update({
            where: {
                id: questionId,
            },
            data: {
                ...values,
            }
        });

        return NextResponse.json(question);
    } catch (error) {
        console.log("[QUESTION_ID]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
