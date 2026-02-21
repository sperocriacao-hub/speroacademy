import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";

const ScannerConfirmPage = async ({
    params,
    searchParams
}: {
    params: { courseId: string; lessonId: string; locale?: string; };
    searchParams: { userId?: string; };
}) => {
    const { userId: currentUserId } = auth();

    if (!currentUserId) {
        return redirect("/");
    }

    const { courseId, lessonId } = params;
    const studentId = searchParams.userId;
    const localeString = params.locale ? `/${params.locale}` : '/pt-BR';

    if (!studentId) {
        return (
            <div className="flex flex-col items-center justify-center p-8 min-h-screen text-center">
                <XCircle className="h-16 w-16 text-rose-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Erro de Validação</h1>
                <p className="text-slate-500 mb-6">QR Code inválido: Aluno não identificado.</p>
                <Link href={`${localeString}/teacher/courses/${courseId}`}>
                    <Button>Voltar para o curso</Button>
                </Link>
            </div>
        );
    }

    // Verify course ownership
    const course = await db.course.findUnique({
        where: {
            id: courseId,
            instructorId: currentUserId,
        }
    });

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center p-8 min-h-screen text-center">
                <XCircle className="h-16 w-16 text-rose-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
                <p className="text-slate-500 mb-6">Apenas o instrutor pode confirmar presença.</p>
                <Link href="/">
                    <Button>Voltar</Button>
                </Link>
            </div>
        );
    }

    // Mark attendance
    try {
        await db.userProgress.upsert({
            where: {
                userId_lessonId: {
                    userId: studentId,
                    lessonId: lessonId,
                }
            },
            update: {
                isCompleted: true,
            },
            create: {
                userId: studentId,
                lessonId: lessonId,
                isCompleted: true,
            }
        });
    } catch (error) {
        console.error("Check-in error", error);
        return (
            <div className="flex flex-col items-center justify-center p-8 min-h-screen text-center">
                <XCircle className="h-16 w-16 text-rose-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Erro no Servidor</h1>
                <p className="text-slate-500 mb-6">Não foi possível registrar a presença.</p>
                <Link href={`${localeString}/teacher/courses/${courseId}`}>
                    <Button>Voltar</Button>
                </Link>
            </div>
        );
    }

    const student = await db.user.findUnique({ where: { id: studentId } });

    return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[calc(100vh-80px)] text-center bg-slate-50">
            <div className="bg-white p-8 rounded-xl shadow-sm border max-w-md w-full flex flex-col items-center">
                <div className="bg-emerald-100 p-4 rounded-full mb-6">
                    <CheckCircle2 className="h-16 w-16 text-emerald-600" />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Check-in Realizado!</h1>
                <p className="text-slate-600 mb-6">
                    Presença confirmada para <strong className="text-slate-800">{student?.name || "o aluno"}</strong>.
                </p>

                <Link href={`${localeString}/teacher/courses/${courseId}`}>
                    <Button variant="outline" className="w-full">Voltar para o painel</Button>
                </Link>
            </div>
        </div>
    );
}

export default ScannerConfirmPage;
