"use client";

import * as z from "zod";
import axios from "axios";
import { PlusCircle, File, Loader2, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Attachment, Course } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AttachmentFormProps {
    initialData: Course & { attachments: Attachment[] };
    courseId: string;
}

const formSchema = z.object({
    url: z.string().min(1),
});

export const AttachmentForm = ({
    initialData,
    courseId
}: AttachmentFormProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const toggleEdit = () => setIsEditing((current) => !current);

    const router = useRouter();

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.post(`/api/courses/${courseId}/attachments`, values);
            toast.success("Attachment created");
            toggleEdit();
            router.refresh();
        } catch {
            toast.error("Something went wrong");
        }
    }

    const onDelete = async (id: string) => {
        try {
            setDeletingId(id);
            await axios.delete(`/api/courses/${courseId}/attachments/${id}`);
            toast.success("Attachment deleted");
            router.refresh();
        } catch {
            toast.error("Something went wrong");
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <Card className="mt-6 border shadow-sm">
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-medium">
                    Course attachments
                </CardTitle>
                <Button onClick={toggleEdit} variant="ghost" size="sm">
                    {isEditing && (
                        <>Cancel</>
                    )}
                    {!isEditing && (
                        <>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add a file
                        </>
                    )}
                </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                {isEditing && (
                    <div>
                        <FileUpload
                            endpoint="courseAttachment"
                            onChange={(url) => {
                                if (url) {
                                    onSubmit({ url: url });
                                }
                            }}
                        />
                        <div className="text-xs text-muted-foreground mt-4">
                            Add anything your students might need to complete the course.
                        </div>
                    </div>
                )}
                {!isEditing && (
                    <>
                        {initialData.attachments.length === 0 && (
                            <p className="text-sm text-slate-500 italic">
                                No attachments yet
                            </p>
                        )}
                        {initialData.attachments.length > 0 && (
                            <div className="space-y-2">
                                {initialData.attachments.map((attachment) => (
                                    <div
                                        key={attachment.id}
                                        className="flex items-center p-3 w-full bg-sky-100 border-sky-200 border text-sky-700 rounded-md"
                                    >
                                        <File className="h-4 w-4 mr-2 flex-shrink-0" />
                                        <p className="text-xs line-clamp-1">
                                            {attachment.name}
                                        </p>
                                        {deletingId === attachment.id && (
                                            <div>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            </div>
                                        )}
                                        {deletingId !== attachment.id && (
                                            <button
                                                onClick={() => onDelete(attachment.id)}
                                                className="ml-auto hover:opacity-75 transition"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
