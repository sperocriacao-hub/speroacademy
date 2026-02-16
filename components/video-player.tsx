"use client";

import axios from "axios";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import ReactPlayer from "react-player";

import { cn } from "@/lib/utils";
import { useConfettiStore } from "@/hooks/use-confetti-store";

interface VideoPlayerProps {
    playbackId: string;
    courseId: string;
    moduleId: string;
    lessonId: string;
    nextLessonId?: string;
    isLocked: boolean;
    completeOnEnd: boolean;
    title: string;
};

export const VideoPlayer = ({
    playbackId,
    courseId,
    moduleId,
    lessonId,
    nextLessonId,
    isLocked,
    completeOnEnd,
    title,
}: VideoPlayerProps) => {
    const [isReady, setIsReady] = useState(false);
    const router = useRouter();
    const confetti = useConfettiStore();

    const onEnd = async () => {
        try {
            if (completeOnEnd) {
                await axios.put(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/progress`, {
                    isCompleted: true,
                });

                if (!nextLessonId) {
                    confetti.onOpen();
                }

                toast.success("Progress updated");
                router.refresh();

                if (nextLessonId) {
                    router.push(`/courses/${courseId}/lessons/${nextLessonId}`)
                }
            }
        } catch {
            toast.error("Something went wrong");
        }
    }

    return (
        <div className="relative aspect-video">
            {!isReady && !isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                    <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                </div>
            )}
            {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900 flex-col gap-y-2 text-secondary">
                    <Lock className="h-8 w-8" />
                    <p className="text-sm">
                        This lesson is locked
                    </p>
                </div>
            )}
            {!isLocked && (
                // @ts-ignore
                <ReactPlayer
                    url={playbackId}
                    className={cn(
                        !isReady && "hidden"
                    )}
                    width="100%"
                    height="100%"
                    controls
                    onReady={() => setIsReady(true)}
                    onEnded={onEnd}
                    config={{
                        file: {
                            attributes: {
                                controlsList: 'nodownload'
                            }
                        }
                    } as any}
                />
            )}
        </div>
    )
}
