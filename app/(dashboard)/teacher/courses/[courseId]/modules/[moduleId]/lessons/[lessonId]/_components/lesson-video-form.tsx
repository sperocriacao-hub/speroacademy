"use client";

import * as z from "zod";
import axios from "axios";
import MuxPlayer from "@mux/mux-player-react";
import { MuxUploader } from "@mux/mux-uploader-react";
import { Pencil, PlusCircle, Video } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Lesson, MuxData } from "@prisma/client";

import { Button } from "@/components/ui/button";

interface LessonVideoFormProps {
    initialData: Lesson & { muxData?: MuxData | null };
    courseId: string;
    moduleId: string;
    lessonId: string;
}

const formSchema = z.object({
    videoUrl: z.string().min(1),
});

export const LessonVideoForm = ({
    initialData,
    courseId,
    moduleId,
    lessonId
}: LessonVideoFormProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const router = useRouter();

    const toggleEdit = () => setIsEditing((current) => !current);

    const onUploadSuccess = () => {
        toast.success("Video uploaded! Processing in background...");
        toggleEdit();
        router.refresh();
    }

    return (
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                Lesson video
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing && (
                        <>Cancel</>
                    )}
                    {!isEditing && !initialData.muxData && (
                        <>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add video
                        </>
                    )}
                    {!isEditing && initialData.muxData && (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit video
                        </>
                    )}
                </Button>
            </div>
            {!isEditing && (
                !initialData.muxData && !initialData.videoUrl ? (
                    <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md mt-2">
                        <Video className="h-10 w-10 text-slate-500" />
                    </div>
                ) : (
                    <div className="relative aspect-video mt-2">
                        {initialData.muxData?.playbackId ? (
                            <MuxPlayer
                                playbackId={initialData.muxData.playbackId}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full w-full bg-slate-900 rounded-md text-white">
                                {initialData.videoUrl ? "External Video" : "Video Processing..."}
                            </div>
                        )}
                    </div>
                )
            )}
            {isEditing && (
                <div>
                    <MuxUploader
                        endpoint={`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/mux`}
                        onSuccess={onUploadSuccess}
                        className="w-full"
                    />
                    <div className="text-xs text-muted-foreground mt-4">
                        Upload this lesson's video. It will be processed automatically.
                    </div>
                </div>
            )}
            {initialData.muxData && !isEditing && (
                <div className="text-xs text-muted-foreground mt-2">
                    Videos can take a few minutes to process. Refresh the page if video does not appear.
                </div>
            )}
        </div>
    )
}

