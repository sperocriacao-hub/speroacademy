import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { File } from "lucide-react";

import { getLesson } from "@/actions/get-lesson";
import { Banner } from "@/components/banner";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";
import { CourseEnrollButton } from "../../_components/course-enroll-button";

import { VideoPlayer } from "@/components/video-player";

const LessonIdPage = async ({
    params
}: {
    params: Promise<{ courseId: string; lessonId: string }>;
}) => {
    const { userId } = await auth();
    const { courseId, lessonId } = await params;

    if (!userId) {
        return redirect("/");
    }

    const {
        lesson,
        module,
        course,
        purchase,
        attachments,
        nextLesson,
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
                        playbackId={lesson.videoUrl!}
                        isLocked={isLocked}
                        completeOnEnd={completeOnEnd}
                    />
                </div>
                <div>
                    <div className="p-4 flex flex-col md:flex-row items-center justify-between">
                        <h2 className="text-2xl font-semibold mb-2">
                            {lesson.title}
                        </h2>
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
