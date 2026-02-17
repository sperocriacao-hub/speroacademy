"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Progress } from "@/components/ui/progress";

export type Student = {
    id: string;
    name: string;
    email: string; // Wait, email might not be available directly on User unless we joined it properly or stored it. 
    // NextAuth/Clerk user object usually has it. In our schema, User has 'email'.
    course: string;
    progress: number;
    enrolledAt: Date;
}

export const columns: ColumnDef<Student>[] = [
    {
        accessorKey: "name",
        header: "Student Name",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "course",
        header: "Course",
    },
    {
        accessorKey: "progress",
        header: "Progress",
        cell: ({ row }) => {
            const progress = row.getValue("progress") as number;
            return (
                <div className="flex items-center gap-x-2">
                    <Progress value={progress} variant="default" className="w-[60%]" />
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
            )
        }
    },
    {
        accessorKey: "enrolledAt",
        header: "Enrolled Date",
        cell: ({ row }) => {
            const date = new Date(row.getValue("enrolledAt"));
            return <div>{date.toLocaleDateString()}</div>
        }
    },
]
