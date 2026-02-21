import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { db } from "@/lib/db";
import { QuizClient } from "./_components/quiz-client";

const StudentQuizPage = async ({
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

    // Verify course enrollment
    const purchase = await db.purchase.findUnique({
        where: {
            userId_courseId: {
                userId,
                courseId,
            }
        }
    });

    if (!purchase) {
        return redirect(`${localeString}/courses/${courseId}`);
    }

    const quiz = await db.quiz.findUnique({
        where: {
            moduleId: moduleId,
        },
        include: {
            questions: {
                orderBy: {
                    position: "asc",
                }
            },
            module: {
                include: {
                    course: true
                }
            }
        }
    });

    if (!quiz || !quiz.isPublished) {
        return redirect(`${localeString}/courses/${courseId}`);
    }

    // Check if user already passed
    const previousAttempt = await db.quizAttempt.findFirst({
        where: {
            userId: userId,
            quizId: quiz.id,
            isPassed: true,
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return (
        <div className="flex flex-col h-full bg-slate-50 min-h-screen pb-10">
            <div className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50 flex items-center shadow-lg">
                <Link
                    href={`${localeString}/courses/${courseId}`}
                    className="flex items-center text-sm font-medium text-slate-300 hover:text-white transition"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar para o curso
                </Link>
                <h1 className="ml-auto text-lg font-semibold text-white">
                    {quiz.module.course.title}
                </h1>
            </div>

            <div className="flex-1 w-full max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="mb-8 border-b pb-6">
                    <h2 className="text-3xl font-bold text-slate-800">{quiz.title}</h2>
                    <p className="text-slate-500 mt-2">
                        Módulo: {quiz.module.title}
                    </p>
                </div>

                {previousAttempt ? (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-lg text-center flex flex-col items-center gap-y-4">
                        <div className="bg-emerald-100 p-4 rounded-full">
                            <span className="text-4xl">🚀</span>
                        </div>
                        <h3 className="text-2xl font-bold">Você já foi aprovado nesta avaliação!</h3>
                        <p>
                            Sua pontuação: <span className="font-bold">{previousAttempt.score.toFixed(1)}%</span>
                        </p>
                        <Link href={`${localeString}/courses/${courseId}`} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-full font-medium transition">
                            Continuar Curso
                        </Link>
                    </div>
                ) : (
                    <QuizClient
                        quiz={quiz}
                        courseId={courseId}
                        moduleId={moduleId}
                    />
                )}
            </div>
        </div>
    );
}

export default StudentQuizPage;
