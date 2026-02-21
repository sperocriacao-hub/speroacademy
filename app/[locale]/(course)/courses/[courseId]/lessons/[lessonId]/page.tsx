import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { File, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import { getLesson } from "@/actions/get-lesson";
import { getProgress } from "@/actions/get-progress";
import { db } from "@/lib/db";
import { Banner } from "@/components/banner";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";
import { Button } from "@/components/ui/button";
import { CourseEnrollButton } from "../../_components/course-enroll-button";
import { CourseSidebar } from "../../_components/course-sidebar";
import { VideoPlayer } from "@/components/video-player";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommentForm } from "./_components/comment-form";
import { CommentList } from "./_components/comment-list";
import { InPersonCheckIn } from "./_components/in-person-checkin";

const LessonIdPage = async ({
    params
}: {
    params: { courseId: string; lessonId: string };
}) => {
    const { userId } = auth();
    const { courseId, lessonId } = await params;

    if (!userId) {
        return redirect("/");
    }

    const {
        lesson,
        module,
        course,
        purchase,
        muxData,
        attachments,
        nextLesson,
        previousLesson,
        userProgress,
        comments,
        isLockedByDrip,
        daysUntilUnlock,
        isLockedByQuiz
    } = await getLesson({
        userId,
        courseId,
        lessonId,
    });

    if (!lesson || !module || !course) {
        return redirect("/");
    }

    let progressCount = 0;

    if (purchase) {
        progressCount = await getProgress(userId, courseId);
    }

    const isLocked = (!lesson.isFree && !purchase) || isLockedByDrip || isLockedByQuiz;
    const completeOnEnd = !!purchase && !userProgress?.isCompleted;

    const courseForSidebar = await db.course.findUnique({
        where: { id: courseId },
        include: {
            modules: {
                where: { isPublished: true },
                orderBy: { position: "asc" },
                include: {
                    lessons: {
                        where: { isPublished: true },
                        orderBy: { position: "asc" },
                        include: {
                            userProgress: { where: { userId } }
                        }
                    }
                }
            }
        }
    });

    return (
        <div className="flex flex-col min-h-screen bg-slate-950 text-slate-200">
            {/* Top Navigation Bar / Breadcrumbs */}
            <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 shadow-sm">
                <div className="flex items-center gap-x-4">
                    <Link href={`/courses/${courseId}`}>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-800">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar ao Curso
                        </Button>
                    </Link>
                    <h1 className="text-lg font-semibold truncate hidden md:block">
                        {module.title}
                    </h1>
                </div>
                {!purchase && (
                    <CourseEnrollButton
                        courseId={courseId}
                        price={course.price!}
                    />
                )}
            </div>
            {isLockedByDrip && (
                <Banner
                    variant="warning"
                    label={`Este módulo foi agendado e estará disponível em ${daysUntilUnlock} dia${daysUntilUnlock === 1 ? '' : 's'}.`}
                />
            )}
            {isLockedByQuiz && (
                <Banner
                    variant="warning"
                    label="Você precisa ser aprovado na avaliação do módulo anterior para acessar esta aula."
                />
            )}

            <div className="flex flex-col xl:flex-row w-full flex-grow">
                {/* Main Video Area (75% on large screens) */}
                <div className="flex-1 w-full xl:w-3/4 flex flex-col items-center">
                    {/* Video Container or Check-in Container */}
                    <div className="w-full max-w-5xl bg-black p-0 md:p-6 lg:p-10 xl:rounded-xl xl:mt-6 xl:shadow-2xl">
                        {lesson.type === "IN_PERSON" ? (
                            <InPersonCheckIn
                                courseId={courseId}
                                lessonId={lesson.id}
                                userId={userId}
                                location={lesson.location}
                                dateTime={lesson.dateTime}
                                isCompleted={!!userProgress?.isCompleted}
                            />
                        ) : (
                            <VideoPlayer
                                lessonId={lessonId}
                                title={lesson.title}
                                courseId={courseId}
                                moduleId={module.id}
                                nextLessonId={nextLesson?.id}
                                playbackId={muxData?.playbackId || ""}
                                isLocked={isLocked}
                                completeOnEnd={completeOnEnd}
                            />
                        )}
                    </div>

                    {/* Content & Tabs Below Video */}
                    <div className="w-full max-w-5xl px-4 py-8 md:px-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-y-4">
                            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                                {lesson.title}
                            </h2>
                            <div className="flex items-center gap-x-2 shrink-0">
                                {previousLesson && (
                                    <Link href={`/courses/${courseId}/lessons/${previousLesson.id}`}>
                                        <Button variant="outline" size="sm" className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Anterior
                                        </Button>
                                    </Link>
                                )}
                                {nextLesson && (
                                    <Link href={`/courses/${courseId}/lessons/${nextLesson.id}`}>
                                        <Button variant="outline" size="sm" className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                                            Próxima
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>

                        <Separator className="bg-slate-800 mb-8" />

                        <Tabs defaultValue="notas" className="w-full">
                            <TabsList className="bg-slate-900 border border-slate-800 p-1 w-full justify-start items-center overflow-x-auto rounded-lg">
                                <TabsTrigger value="notas" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400">
                                    Notas da Aula
                                </TabsTrigger>
                                <TabsTrigger value="material" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400">
                                    Material de Apoio
                                </TabsTrigger>
                                <TabsTrigger value="forum" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400">
                                    Comentários
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="notas" className="mt-6 text-slate-300">
                                <div className="prose prose-invert max-w-none">
                                    <Preview value={lesson.description!} />
                                </div>
                            </TabsContent>

                            <TabsContent value="material" className="mt-6">
                                {attachments.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {attachments.map((attachment) => (
                                            <a
                                                href={attachment.url}
                                                target="_blank"
                                                key={attachment.id}
                                                className="flex items-center p-4 w-full bg-slate-900 border border-slate-800 hover:border-slate-600 text-sky-400 rounded-lg hover:bg-slate-800 transition-colors"
                                            >
                                                <div className="bg-slate-800 p-2 rounded-md mr-4">
                                                    <File className="h-6 w-6 text-sky-500" />
                                                </div>
                                                <span className="font-medium line-clamp-1 truncate block w-full">{attachment.name}</span>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-slate-500 text-center py-10 border border-dashed border-slate-800 rounded-lg">
                                        Nenhum material de apoio disponível para esta aula.
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="forum" className="mt-6 text-slate-300">
                                <div className="p-0 md:p-6 bg-slate-900 md:border border-slate-800 rounded-lg min-h-[400px]">
                                    <div className="flex flex-col gap-y-4">
                                        <h3 className="text-xl font-bold text-white mb-2">Fórum de Dúvidas</h3>
                                        <p className="text-sm text-slate-400 mb-6">
                                            Tem alguma dúvida sobre esta aula? Deixe um comentário abaixo para o formador.
                                        </p>
                                        <CommentForm
                                            courseId={courseId}
                                            lessonId={lessonId}
                                        />
                                        <Separator className="bg-slate-800 my-6" />
                                        <CommentList comments={comments} />
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {/* Sidebar (25% on large screens) */}
                <div className="hidden xl:flex w-full xl:w-1/4 bg-slate-900 border-l border-slate-800 flex-col relative z-20 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.3)]">
                    {courseForSidebar && (
                        <CourseSidebar
                            course={courseForSidebar}
                            progressCount={progressCount}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default LessonIdPage;
