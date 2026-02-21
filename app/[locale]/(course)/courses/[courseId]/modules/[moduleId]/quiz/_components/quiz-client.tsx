"use client";

import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Quiz, Question } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Circle, CheckCircle2 } from "lucide-react";

interface Option {
    id: string;
    text: string;
    isCorrect: boolean;
}

interface QuizClientProps {
    quiz: Quiz & { questions: Question[] };
    courseId: string;
    moduleId: string;
}

export const QuizClient = ({ quiz, courseId, moduleId }: QuizClientProps) => {
    const router = useRouter();
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Result State
    const [hasFinished, setHasFinished] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const [isPassed, setIsPassed] = useState<boolean>(false);

    const questions = quiz.questions || [];

    const handleSelectOption = (questionId: string, optionId: string) => {
        setAnswers({
            ...answers,
            [questionId]: optionId
        });
    };

    const isAllAnswered = questions.every(q => answers[q.id]);

    const onSubmit = async () => {
        try {
            setIsSubmitting(true);
            const response = await axios.post(`/api/courses/${courseId}/modules/${moduleId}/quiz/attempt`, {
                answers
            });

            setScore(response.data.score);
            setIsPassed(response.data.isPassed);
            setHasFinished(true);

            if (response.data.isPassed) {
                toast.success("Parabéns! Você foi aprovado!");
            } else {
                toast.error("Você não atingiu a pontuação mínima.");
            }

            router.refresh();
        } catch {
            toast.error("Ocorreu um erro ao enviar a prova.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (hasFinished) {
        return (
            <div className={`p-8 rounded-lg border text-center ${isPassed ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                <h3 className={`text-2xl font-bold mb-4 ${isPassed ? 'text-emerald-800' : 'text-rose-800'}`}>
                    {isPassed ? "Aprovado!" : "Reprovado"}
                </h3>
                <p className="text-lg">
                    Sua pontuação final: <strong className={isPassed ? 'text-emerald-700' : 'text-rose-700'}>{score?.toFixed(1)}%</strong>
                </p>

                {isPassed ? (
                    <Button
                        className="mt-6 bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto"
                        onClick={() => router.push(`/courses/${courseId}`)}
                    >
                        Continuar Curso
                    </Button>
                ) : (
                    <Button
                        className="mt-6 bg-rose-600 hover:bg-rose-700 w-full md:w-auto"
                        onClick={() => {
                            setHasFinished(false);
                            setAnswers({});
                        }}
                    >
                        Tentar Novamente
                    </Button>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {questions.map((question, index) => {
                const options = (question.options as unknown as Option[]) || [];

                return (
                    <div key={question.id} className="bg-slate-50 border border-slate-200 rounded-lg p-6 flex flex-col gap-y-4">
                        <div className="flex gap-x-2">
                            <span className="font-bold text-slate-400">{index + 1}.</span>
                            <span className="font-semibold text-slate-800 text-lg leading-snug">
                                {question.prompt}
                            </span>
                        </div>

                        <div className="flex flex-col gap-y-3 mt-4">
                            {options.map((option) => {
                                const isSelected = answers[question.id] === option.id;

                                return (
                                    <div
                                        key={option.id}
                                        onClick={() => handleSelectOption(question.id, option.id)}
                                        className={cn(
                                            "flex items-center gap-x-3 p-4 border rounded-md cursor-pointer transition-all w-full",
                                            isSelected
                                                ? "bg-sky-50 border-sky-600 text-sky-800 shadow-sm"
                                                : "bg-white hover:bg-slate-100 border-slate-200 hover:border-slate-300 text-slate-600"
                                        )}
                                    >
                                        {isSelected ? (
                                            <CheckCircle2 className="h-5 w-5 text-sky-600 flex-shrink-0" />
                                        ) : (
                                            <Circle className="h-5 w-5 text-slate-400 flex-shrink-0" />
                                        )}
                                        <span className={cn("text-base", isSelected && "font-medium")}>
                                            {option.text}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            })}

            <div className="pt-6 border-t flex flex-col items-center gap-y-2">
                <Button
                    size="lg"
                    className="w-full md:w-1/2 bg-slate-900 text-white font-semibold flex items-center justify-center p-6 text-lg"
                    disabled={!isAllAnswered || isSubmitting}
                    onClick={onSubmit}
                >
                    Finalizar Avaliação
                </Button>
                {!isAllAnswered && (
                    <p className="text-sm text-slate-500">
                        Responda todas as perguntas para enviar.
                    </p>
                )}
            </div>
        </div>
    );
};
