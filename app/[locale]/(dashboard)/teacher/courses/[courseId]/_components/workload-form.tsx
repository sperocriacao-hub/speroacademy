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
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface WorkloadFormProps {
    initialData: {
        workload: number | null;
    };
    courseId: string;
}

const formSchema = z.object({
    workload: z.coerce.number().min(1, {
        message: "Workload must be at least 1 hour",
    }),
});

export const WorkloadForm = ({
    initialData,
    courseId
}: WorkloadFormProps) => {
    const [isEditing, setIsEditing] = useState(false);

    const toggleEdit = () => setIsEditing((current) => !current);

    const router = useRouter();
    const t = useTranslations("CourseSetup");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            workload: initialData.workload || 0
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
                    {t("courseWorkload")}
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
                        !initialData.workload && "text-slate-500 italic"
                    )}>
                        {initialData.workload ? `${initialData.workload} ${t("hours")}` : t("noWorkload")}
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
                                name="workload"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                disabled={isSubmitting}
                                                placeholder={t("workloadPlaceholder")}
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
