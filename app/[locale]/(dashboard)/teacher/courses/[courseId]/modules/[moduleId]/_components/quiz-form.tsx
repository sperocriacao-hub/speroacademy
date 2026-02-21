"use client";

import axios from "axios";
import { PlusCircle, Pencil } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Module, Quiz } from "@prisma/client";

import { Button } from "@/components/ui/button";

interface QuizFormProps {
    initialData: Module & { quiz: Quiz | null };
    courseId: string;
    moduleId: string;
};

export const QuizForm = ({
    initialData,
    courseId,
    moduleId
}: QuizFormProps) => {
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();

    const onCreate = async () => {
        try {
            setIsCreating(true);
            await axios.post(`/api/courses/${courseId}/modules/${moduleId}/quiz`, {
                title: `Avaliação do Módulo`
            });
            toast.success("Avaliação criada!");
            router.refresh();
        } catch {
            toast.error("Ocorreu um erro ao criar a avaliação.");
        } finally {
            setIsCreating(false);
        }
    }

    const onEdit = () => {
        router.push(`/teacher/courses/${courseId}/modules/${moduleId}/quiz`);
    }

    return (
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                Avaliação do Módulo (Quiz)
                {!initialData.quiz && (
                    <Button onClick={onCreate} variant="ghost" disabled={isCreating}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Criar Avaliação
                    </Button>
                )}
                {initialData.quiz && (
                    <Button onClick={onEdit} variant="ghost">
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar Avaliação
                    </Button>
                )}
            </div>
            {initialData.quiz ? (
                <div className="text-sm mt-2 text-slate-700">
                    Prova {initialData.quiz.isPublished ? "publicada" : "em rascunho"}. Os alunos que não atingirem a média serão bloqueados de acessar as próximas aulas.
                </div>
            ) : (
                <div className="text-sm mt-2 text-slate-500 italic">
                    Nenhuma prova adicionada a este módulo.
                </div>
            )}
        </div>
    )
}
