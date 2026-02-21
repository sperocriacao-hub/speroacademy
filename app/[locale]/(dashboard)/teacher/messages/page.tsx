import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";

import { db } from "@/lib/db";
import { resolveComment } from "./_actions/resolve-comment"; // Action to mark as resolved
import { MessageCard } from "./_components/message-card";

const MessagesPage = async () => {
    const { userId } = auth();

    if (!userId) {
        return redirect("/");
    }

    // Fetch all comments for lessons in modules in courses owned by the user
    const comments = await db.comment.findMany({
        where: {
            lesson: {
                module: {
                    course: {
                        instructorId: userId,
                    }
                }
            }
        },
        include: {
            user: true,
            lesson: {
                include: {
                    module: {
                        include: {
                            course: true,
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    const pendingComments = comments.filter(c => !c.isResolved);
    const resolvedComments = comments.filter(c => c.isResolved);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Fórum de Dúvidas</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-rose-600">Dúvidas Pendentes ({pendingComments.length})</h2>
                    {pendingComments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Você não tem dúvidas pendentes.</p>
                    ) : (
                        pendingComments.map((comment) => (
                            <MessageCard key={comment.id} comment={comment} isResolved={false} />
                        ))
                    )}
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-emerald-600">Dúvidas Resolvidas ({resolvedComments.length})</h2>
                    {resolvedComments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhuma dúvida respondida ainda.</p>
                    ) : (
                        resolvedComments.map((comment) => (
                            <MessageCard key={comment.id} comment={comment} isResolved={true} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default MessagesPage;
