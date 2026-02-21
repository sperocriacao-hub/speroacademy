"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";

export async function resolveComment(commentId: string) {
    try {
        const { userId } = auth();

        if (!userId) {
            return { error: "Não autorizado" };
        }

        const comment = await db.comment.findUnique({
            where: { id: commentId },
            include: {
                lesson: {
                    include: {
                        module: {
                            include: {
                                course: true,
                            }
                        }
                    }
                }
            }
        });

        if (!comment) {
            return { error: "Comentário não encontrado" };
        }

        if (comment.lesson.module.course.instructorId !== userId) {
            return { error: "Sem permissão" };
        }

        const updatedComment = await db.comment.update({
            where: { id: commentId },
            data: { isResolved: true },
        });

        // Revalidate teacher dashboard and the specific lesson page
        revalidatePath(`/teacher/messages`);
        revalidatePath(`/courses/${comment.lesson.module.courseId}/lessons/${comment.lessonId}`);

        return { success: true, count: 1 };
    } catch (error) {
        console.log("[RESOLVE_COMMENT]", error);
        return { error: "Ocorreu um erro ao resolver o comentário" };
    }
}
