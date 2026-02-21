"use client";

import { Trash } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/modals/confirm-modal";

interface QuestionActionsProps {
    disabled: boolean;
    courseId: string;
    moduleId: string;
    questionId: string;
}

export const QuestionActions = ({
    disabled,
    courseId,
    moduleId,
    questionId,
}: QuestionActionsProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const onDelete = async () => {
        try {
            setIsLoading(true);
            await axios.delete(`/api/courses/${courseId}/modules/${moduleId}/quiz/questions/${questionId}`);
            toast.success("Pergunta deletada");
            router.refresh();
            router.push(`/teacher/courses/${courseId}/modules/${moduleId}/quiz`);
        } catch {
            toast.error("Algo deu errado ao deletar");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex items-center gap-x-2">
            <ConfirmModal onConfirm={onDelete}>
                <Button size="sm" disabled={isLoading} variant="destructive">
                    <Trash className="h-4 w-4 mr-2" />
                    Deletar Pergunta
                </Button>
            </ConfirmModal>
        </div>
    )
}
