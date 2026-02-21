"use client";

import { useState, useTransition } from "react";
import { formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, MessageSquare, PlayCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

import { resolveComment } from "../_actions/resolve-comment";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface MessageCardProps {
    comment: any; // Using any here for quick dev, ideal is Prisma type with Includes
    isResolved: boolean;
}

export const MessageCard = ({ comment, isResolved }: MessageCardProps) => {
    const [isPending, startTransition] = useTransition();
    const [resolved, setResolved] = useState(isResolved);

    const onResolve = () => {
        startTransition(async () => {
            const result = await resolveComment(comment.id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Marcado como resolvido!");
                setResolved(true);
            }
        });
    }

    if (resolved && !isResolved) return null; // Hide from pending list instantly

    return (
        <Card className="bg-white shadow-sm overflow-hidden flex flex-col relative">
            <div className="absolute top-2 right-2 text-xs text-muted-foreground">
                {formatDistance(new Date(comment.createdAt), new Date(), { addSuffix: true, locale: ptBR })}
            </div>
            <CardContent className="p-4 flex flex-col pt-6 gap-y-3">
                <div className="flex items-center gap-x-2 border-b pb-2">
                    <div className="bg-sky-100 p-2 rounded-full">
                        <MessageSquare className="h-4 w-4 text-sky-700" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm">{comment.user.name || "Aluno"}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {comment.user.email}
                        </span>
                    </div>
                </div>

                <div className="text-sm bg-slate-50 p-3 rounded-md border text-slate-700">
                    "{comment.text}"
                </div>

                <div className="flex flex-col gap-y-1">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Origem da Dúvida</span>
                    <Link
                        href={`/courses/${comment.lesson.module.course.id}/lessons/${comment.lessonId}`}
                        className="text-sm font-medium hover:underline text-sky-700 flex items-center gap-x-1"
                        target="_blank"
                    >
                        <PlayCircle className="h-4 w-4" />
                        {comment.lesson.module.course.title} - {comment.lesson.title}
                    </Link>
                </div>

                {!resolved && (
                    <Button
                        onClick={onResolve}
                        disabled={isPending}
                        className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700"
                        size="sm"
                    >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Marcar como Resolvido
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
