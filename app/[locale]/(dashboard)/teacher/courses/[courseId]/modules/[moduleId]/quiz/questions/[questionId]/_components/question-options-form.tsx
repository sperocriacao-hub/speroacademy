"use client";

import axios from "axios";
import { PlusCircle, Trash, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Question } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Option {
    id: string;
    text: string;
    isCorrect: boolean;
}

interface QuestionOptionsFormProps {
    initialData: Question;
    courseId: string;
    moduleId: string;
    questionId: string;
}

export const QuestionOptionsForm = ({
    initialData,
    courseId,
    moduleId,
    questionId,
}: QuestionOptionsFormProps) => {
    const [isCreating, setIsCreating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [newOptionText, setNewOptionText] = useState("");

    const router = useRouter();

    const options: Option[] = (initialData.options as unknown as Option[]) || [];

    const toggleCreating = () => {
        setIsCreating((current) => !current);
        setNewOptionText("");
    };

    const updateOptions = async (newOptions: Option[]) => {
        try {
            setIsLoading(true);
            await axios.patch(`/api/courses/${courseId}/modules/${moduleId}/quiz/questions/${questionId}`, {
                options: newOptions
            });
            toast.success("Opções atualizadas");
            router.refresh();
        } catch {
            toast.error("Ocorreu um erro ao atualizar as opções");
        } finally {
            setIsLoading(false);
        }
    };

    const onAddOption = () => {
        if (!newOptionText.trim()) return;

        const newOption: Option = {
            id: crypto.randomUUID(),
            text: newOptionText,
            isCorrect: options.length === 0, // Mark first option as correct by default
        };

        updateOptions([...options, newOption]);
        toggleCreating();
    };

    const onDeleteOption = (id: string) => {
        const nextOptions = options.filter(opt => opt.id !== id);
        // If we deleted the correct option and there are still options left, mark the first one as correct
        if (options.find(opt => opt.id === id)?.isCorrect && nextOptions.length > 0) {
            nextOptions[0].isCorrect = true;
        }
        updateOptions(nextOptions);
    };

    const onSetCorrect = (id: string) => {
        const nextOptions = options.map(opt => ({
            ...opt,
            isCorrect: opt.id === id
        }));
        updateOptions(nextOptions);
    };

    return (
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                Alternativas
                <Button onClick={toggleCreating} variant="ghost" disabled={isLoading}>
                    {isCreating ? (
                        <>Cancelar</>
                    ) : (
                        <>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Adicionar alternativa
                        </>
                    )}
                </Button>
            </div>

            {isCreating && (
                <div className="space-y-4 mt-4">
                    <Input
                        disabled={isLoading}
                        placeholder="Ex: 'React é uma biblioteca JavaScript.'"
                        value={newOptionText}
                        onChange={(e) => setNewOptionText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onAddOption();
                            }
                        }}
                    />
                    <Button
                        disabled={!newOptionText.trim() || isLoading}
                        onClick={onAddOption}
                    >
                        Criar
                    </Button>
                </div>
            )}

            {!isCreating && (
                <div className={cn(
                    "text-sm mt-2",
                    !options.length && "text-slate-500 italic"
                )}>
                    {!options.length && "Nenhuma alternativa adicionada."}
                    <div className="flex flex-col gap-y-2 mt-4">
                        {options.map((option) => (
                            <div
                                key={option.id}
                                className={cn(
                                    "flex items-center justify-between bg-white border rounded-md p-3",
                                    option.isCorrect && "border-emerald-500 bg-emerald-50"
                                )}
                            >
                                <div
                                    className="flex items-center gap-x-2 cursor-pointer flex-1"
                                    onClick={() => onSetCorrect(option.id)}
                                >
                                    {option.isCorrect ? (
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                                    ) : (
                                        <Circle className="h-5 w-5 text-slate-400 shrink-0 hover:text-slate-600 transition" />
                                    )}
                                    <span className={cn(
                                        "text-sm",
                                        option.isCorrect && "text-emerald-700 font-medium"
                                    )}>
                                        {option.text}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-1 text-slate-500 hover:text-rose-600"
                                    onClick={() => onDeleteOption(option.id)}
                                    disabled={isLoading}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
