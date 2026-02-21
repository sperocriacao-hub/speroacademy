"use client";

import { Trash } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/modals/confirm-modal";

interface QuizActionsProps {
    disabled: boolean;
    courseId: string;
    moduleId: string;
    quizId: string;
    isPublished: boolean;
}

export const QuizActions = ({
    disabled,
    courseId,
    moduleId,
    quizId,
    isPublished,
}: QuizActionsProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const onClick = async () => {
        try {
            setIsLoading(true);

            if (isPublished) {
                await axios.patch(`/api/courses/${courseId}/modules/${moduleId}/quiz/${quizId}/unpublish`);
                toast.success("Prova despublicada");
            } else {
                await axios.patch(`/api/courses/${courseId}/modules/${moduleId}/quiz/${quizId}/publish`);
                toast.success("Prova publicada");
            }

            router.refresh();
        } catch {
            toast.error("Ocorreu um erro");
        } finally {
            setIsLoading(false);
        }
    }

    const onDelete = async () => {
        try {
            setIsLoading(true);
            await axios.delete(`/api/courses/${courseId}/modules/${moduleId}/quiz/${quizId}`);
            toast.success("Prova deletada");
            router.refresh();
            router.push(`/teacher/courses/${courseId}/modules/${moduleId}`);
        } catch {
            toast.error("Algo deu errado ao deletar");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex items-center gap-x-2">
            <Button
                onClick={onClick}
                disabled={disabled || isLoading}
                variant="outline"
                size="sm"
            >
                {isPublished ? "Despublicar" : "Publicar"}
            </Button>
            <ConfirmModal onConfirm={onDelete}>
                <Button size="sm" disabled={isLoading}>
                    <Trash className="h-4 w-4" />
                </Button>
            </ConfirmModal>
        </div>
    )
}
