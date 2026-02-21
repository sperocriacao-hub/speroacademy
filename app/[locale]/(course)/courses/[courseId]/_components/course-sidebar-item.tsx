"use client";

import { CheckCircle, Lock, PlayCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

interface CourseSidebarItemProps {
    label: string;
    id: string;
    isCompleted: boolean;
    courseId: string;
    moduleId: string;
    isLocked: boolean;
};

export const CourseSidebarItem = ({
    label,
    id,
    isCompleted,
    courseId,
    moduleId,
    isLocked,
}: CourseSidebarItemProps) => {
    const pathname = usePathname();
    const router = useRouter();

    const Icon = isLocked ? Lock : (isCompleted ? CheckCircle : PlayCircle);
    const isActive = pathname?.includes(id);

    const onClick = () => {
        router.push(`/courses/${courseId}/lessons/${id}`);
        // Note: URL structure assumes /courses/[courseId]/lessons/[lessonId] 
        // If we want nested /modules/, we need to adjust, but typically for players flat is fine if lessonId is unique or we use query params.
        // However, our folder structure is /courses/[courseId]/lessons/[lessonId] so this works.
    }

    return (
        <button
            onClick={onClick}
            type="button"
            className={cn(
                "flex items-center gap-x-2 text-slate-400 text-sm font-medium transition-all hover:text-white hover:bg-slate-800",
                isActive && "text-white bg-slate-800/80 hover:bg-slate-800/80",
                isCompleted && "text-emerald-500 hover:text-emerald-400",
                isCompleted && isActive && "bg-emerald-900/20",
            )}
        >
            <div className="flex items-center gap-x-2 py-3 px-4 w-full">
                <Icon
                    size={18}
                    className={cn(
                        "text-slate-500 shrink-0",
                        isActive && "text-white",
                        isCompleted && "text-emerald-500"
                    )}
                />
                <span className="truncate text-left">{label}</span>
            </div>
            <div className={cn(
                "ml-auto opacity-0 border-2 border-white h-full transition-all shrink-0",
                isActive && "opacity-100",
                isCompleted && "border-emerald-500"
            )} />
        </button>
    )
}
