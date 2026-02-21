import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowLeft, LayoutDashboard, ListChecks } from "lucide-react";
import Link from "next/link";

import { db } from "@/lib/db";
import { IconBadge } from "@/components/icon-badge";
import { QuizTitleForm } from "./_components/quiz-title-form";
import { QuestionsForm } from "./_components/questions-form";
import { QuizActions } from "./_components/quiz-actions";

const QuizIdPage = async ({
    params
}: {
    params: { courseId: string; moduleId: string; locale?: string; }
}) => {
    const { userId } = auth();

    if (!userId) {
        return redirect("/");
    }

    const { courseId, moduleId } = params;
    const localeString = params.locale ? `/${params.locale}` : '/pt-BR';

    const quiz = await db.quiz.findUnique({
        where: {
            moduleId: moduleId,
        },
        include: {
            questions: {
                orderBy: {
                    position: "asc",
                }
            }
        }
    });

    if (!quiz) {
        return redirect(`${localeString}/teacher/courses/${courseId}/modules/${moduleId}`);
    }

    const requiredFields = [
        quiz.title,
        quiz.questions.length > 0
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
                        href={`${localeString}/teacher/courses/${courseId}/modules/${moduleId}`}
                        className="flex items-center text-sm hover:opacity-75 transition mb-6"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar para configurações do módulo
                    </Link>
                    <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col gap-y-2">
                            <h1 className="text-2xl font-medium">
                                Configuração da Prova
                            </h1>
                            <span className="text-sm text-slate-700">
                                Complete os campos obrigatórios {completionText}
                            </span>
                        </div>
                        <QuizActions
                            disabled={!isComplete}
                            courseId={courseId}
                            moduleId={moduleId}
                            quizId={quiz.id}
                            isPublished={quiz.isPublished}
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
                                Personalize a prova
                            </h2>
                        </div>
                        <QuizTitleForm
                            initialData={quiz}
                            courseId={courseId}
                            moduleId={moduleId}
                            quizId={quiz.id}
                        />
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-x-2">
                        <IconBadge icon={ListChecks} />
                        <h2 className="text-xl">
                            Gerenciar Perguntas
                        </h2>
                    </div>
                    <QuestionsForm
                        initialData={quiz}
                        courseId={courseId}
                        moduleId={moduleId}
                        quizId={quiz.id}
                    />
                </div>
            </div>
        </div>
    );
}

export default QuizIdPage;
