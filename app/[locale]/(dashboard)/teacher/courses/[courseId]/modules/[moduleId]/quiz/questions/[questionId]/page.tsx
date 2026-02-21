import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowLeft, LayoutDashboard, ListChecks } from "lucide-react";
import Link from "next/link";

import { db } from "@/lib/db";
import { IconBadge } from "@/components/icon-badge";
import { QuestionPromptForm } from "./_components/question-prompt-form";
import { QuestionOptionsForm } from "./_components/question-options-form";
import { QuestionActions } from "./_components/question-actions";

const QuestionIdPage = async ({
    params
}: {
    params: { courseId: string; moduleId: string; questionId: string; locale?: string; }
}) => {
    const { userId } = auth();

    if (!userId) {
        return redirect("/");
    }

    const { courseId, moduleId, questionId } = params;
    const localeString = params.locale ? `/${params.locale}` : '/pt-BR';

    const question = await db.question.findUnique({
        where: {
            id: questionId
        }
    });

    if (!question) {
        return redirect(`${localeString}/teacher/courses/${courseId}/modules/${moduleId}/quiz`);
    }

    // Evaluate options completion. Needs at least 2 options and 1 correct option.
    const options = (question.options as any[]) || [];
    const hasEnoughOptions = options.length >= 2;
    const hasCorrectOption = options.some(opt => opt.isCorrect);

    const requiredFields = [
        question.prompt,
        hasEnoughOptions && hasCorrectOption
    ];

    const totalFields = requiredFields.length;
    const completedFields = requiredFields.filter(Boolean).length;
    const completionText = `(${completedFields}/${totalFields})`;
    const isComplete = requiredFields.every(Boolean);

    return (
        <div className="p-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-y-2">
                    <Link
                        href={`${localeString}/teacher/courses/${courseId}/modules/${moduleId}/quiz`}
                        className="flex items-center text-sm hover:opacity-75 transition mb-6"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar para a Prova
                    </Link>
                    <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col gap-y-2">
                            <h1 className="text-2xl font-medium">
                                Configuração da Pergunta
                            </h1>
                            <span className="text-sm text-slate-700">
                                Complete os campos obrigatórios {completionText}
                            </span>
                        </div>
                        <QuestionActions
                            disabled={!isComplete}
                            courseId={courseId}
                            moduleId={moduleId}
                            questionId={questionId}
                        />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
                <div className="space-y-4">
                    <div>
                        <div className="flex items-center gap-x-2">
                            <IconBadge icon={LayoutDashboard} />
                            <h2 className="text-xl">
                                Enunciado da Pergunta
                            </h2>
                        </div>
                        <QuestionPromptForm
                            initialData={question}
                            courseId={courseId}
                            moduleId={moduleId}
                            questionId={questionId}
                        />
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-x-2">
                        <IconBadge icon={ListChecks} />
                        <h2 className="text-xl">
                            Alternativas
                        </h2>
                    </div>
                    <QuestionOptionsForm
                        initialData={question}
                        courseId={courseId}
                        moduleId={moduleId}
                        questionId={questionId}
                    />
                </div>
            </div>
        </div>
    );
}

export default QuestionIdPage;
