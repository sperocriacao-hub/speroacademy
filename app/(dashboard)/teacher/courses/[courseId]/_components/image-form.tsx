"use client";

import * as z from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ImageIcon, Pencil, PlusCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { FileUpload } from "@/components/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ImageFormProps {
    initialData: {
        thumbnail: string | null;
    };
    courseId: string;
}

const formSchema = z.object({
    thumbnail: z.string().min(1, {
        message: "Image is required",
    }),
});

export const ImageForm = ({
    initialData,
    courseId
}: ImageFormProps) => {
    const [isEditing, setIsEditing] = useState(false);

    const toggleEdit = () => setIsEditing((current) => !current);

    const router = useRouter();

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.patch(`/api/courses/${courseId}`, values);
            toast.success("Course updated");
            toggleEdit();
            router.refresh();
        } catch {
            toast.error("Something went wrong");
        }
    }

    return (
        <Card className="mt-6 border shadow-sm">
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-medium">
                    Course image
                </CardTitle>
                <Button onClick={toggleEdit} variant="ghost" size="sm">
                    {isEditing && (
                        <>Cancel</>
                    )}
                    {!isEditing && !initialData.thumbnail && (
                        <>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add an image
                        </>
                    )}
                    {!isEditing && initialData.thumbnail && (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                        </>
                    )}
                </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                {!isEditing && (
                    !initialData.thumbnail ? (
                        <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
                            <ImageIcon className="h-10 w-10 text-slate-500" />
                        </div>
                    ) : (
                        <div className="relative aspect-video mt-2">
                            <Image
                                alt="Upload"
                                fill
                                className="object-cover rounded-md"
                                src={initialData.thumbnail}
                            />
                        </div>
                    )
                )}
                {isEditing && (
                    <div>
                        <FileUpload
                            endpoint="courseImage"
                            onChange={(url) => {
                                if (url) {
                                    onSubmit({ thumbnail: url });
                                }
                            }}
                        />
                        <div className="text-xs text-muted-foreground mt-4">
                            16:9 aspect ratio recommended
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
