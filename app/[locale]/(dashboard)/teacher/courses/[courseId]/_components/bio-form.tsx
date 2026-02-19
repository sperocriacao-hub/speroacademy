"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface BioFormProps {
    initialData: {
        instructorBio: string | null;
    };
    courseId: string;
}

const formSchema = z.object({
    instructorBio: z.string().min(1, {
        message: "Bio is required",
    }),
});

export const BioForm = ({
    initialData,
    courseId
}: BioFormProps) => {
    const [isEditing, setIsEditing] = useState(false);

    const toggleEdit = () => setIsEditing((current) => !current);

    const router = useRouter();
    const t = useTranslations("CourseSetup");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            instructorBio: initialData.instructorBio || ""
        },
    });

    const { isSubmitting, isValid } = form.formState;

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
                    {t("instructorBio")}
                </CardTitle>
                <Button onClick={toggleEdit} variant="ghost" size="sm">
                    {isEditing ? (
                        <>{t("cancel")}</>
                    ) : (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            {t("edit")}
                        </>
                    )}
                </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                {!isEditing && (
                    <p className={cn(
                        "text-sm",
                        !initialData.instructorBio && "text-slate-500 italic"
                    )}>
                        {initialData.instructorBio || t("noBio")}
                    </p>
                )}
                {isEditing && (
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="instructorBio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Textarea
                                                disabled={isSubmitting}
                                                placeholder={t("bioPlaceholder")}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex items-center gap-x-2">
                                <Button
                                    disabled={!isValid || isSubmitting}
                                    type="submit"
                                >
                                    {t("save")}
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </CardContent>
        </Card>
    )
}
