import { Comment, User } from "@prisma/client";
import { formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CommentListProps {
    comments: (Comment & {
        user: User;
    })[];
}

export const CommentList = ({
    comments,
}: CommentListProps) => {

    if (!comments.length) {
        return (
            <div className="text-center text-slate-500 mt-4 h-full flex flex-col justify-center items-center">
                Seja o primeiro a deixar uma dúvida ou comentário!
            </div>
        )
    }

    return (
        <div className="mt-8 space-y-4">
            {comments.map((comment) => (
                <div key={comment.id} className="flex gap-x-4 p-4 border border-slate-800 rounded-md bg-slate-900/50">
                    <div className="h-10 w-10 shrink-0 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 font-semibold uppercase">
                        {comment.user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex flex-col w-full">
                        <div className="flex items-center gap-x-2">
                            <span className="font-semibold text-slate-200">
                                {comment.user?.name || "Usuário"}
                            </span>
                            <span className="text-xs text-slate-500">
                                {formatDistance(new Date(comment.createdAt), new Date(), {
                                    addSuffix: true,
                                    locale: ptBR,
                                })}
                            </span>
                        </div>
                        <p className="text-slate-300 mt-1 text-sm">
                            {comment.text}
                        </p>
                        {comment.isResolved && (
                            <span className="mt-2 text-xs text-emerald-500 font-medium bg-emerald-500/10 w-fit px-2 py-1 rounded-md">
                                Respondido pelo Formador
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
