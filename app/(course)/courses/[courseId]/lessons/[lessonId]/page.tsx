import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { File, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import { getLesson } from "@/actions/get-lesson";
import { Banner } from "@/components/banner";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";
import { Button } from "@/components/ui/button";
import { CourseEnrollButton } from "../../_components/course-enroll-button";

import { VideoPlayer } from "@/components/video-player";

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
        userProgress
    } = await getLesson({
        userId,
        courseId,
        lessonId,
    });

    if (!lesson || !module || !course) {
        return redirect("/");
    }

    const isLocked = !lesson.isFree && !purchase;
    const completeOnEnd = !!purchase && !userProgress?.isCompleted;

    return (
        <div>
            <div className="flex flex-col max-w-4xl mx-auto pb-20">
                <div className="p-4">
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
                </div>
                <div>
                    <div className="p-4 flex flex-col md:flex-row items-center justify-between border-b">
                        <div className="flex flex-col gap-y-2">
                            <h2 className="text-2xl font-semibold">
                                {lesson.title}
                            </h2>
                            <div className="flex items-center gap-x-2">
                                {previousLesson && (
                                    <Link href={`/courses/${courseId}/lessons/${previousLesson.id}`}>
                                        <Button variant="outline" size="sm">
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Previous
                                        </Button>
                                    </Link>
                                )}
                                {nextLesson && (
                                    <Link href={`/courses/${courseId}/lessons/${nextLesson.id}`}>
                                        <Button variant="outline" size="sm">
                                            Next
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {!purchase && (
                            <CourseEnrollButton
                                courseId={courseId}
                                price={course.price!}
                            />
                        )}
                    </div>
                    <Separator />
                    <div>
                        <Preview value={lesson.description!} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LessonIdPage;
