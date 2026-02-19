"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, PlusCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Module, Course } from "@prisma/client";

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
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

interface ModulesFormProps {
    initialData: Course & { modules: Module[] };
    courseId: string;
}

const formSchema = z.object({
    title: z.string().min(1),
});

export const ModulesForm = ({
    initialData,
    courseId
}: ModulesFormProps) => {
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const toggleCreating = () => setIsCreating((current) => !current);

    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
        },
    });

    const { isSubmitting, isValid } = form.formState;

    const t = useTranslations("CourseSetup");

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.post(`/api/courses/${courseId}/modules`, values);
            toast.success("Module created");
            toggleCreating();
            router.refresh();
        } catch {
            toast.error("Something went wrong");
        }
    }

    const modules = initialData.modules || [];

    return (
        <Card className="mt-6 border shadow-sm">
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-medium">
                    {t("courseChapters")}
                </CardTitle>
                <Button onClick={toggleCreating} variant="ghost" size="sm">
                    {isCreating ? (
                        <>{t("cancel")}</>
                    ) : (
                        <>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            {t("addChapter")}
                        </>
                    )}
                </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                {isCreating && (
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4 mb-4"
                        >
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                disabled={isSubmitting}
                                                placeholder={t("chapterPlaceholder")}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                disabled={!isValid || isSubmitting}
                                type="submit"
                            >
                                {t("create")}
                            </Button>
                        </form>
                    </Form>
                )}
                {!isCreating && (
                    <div className={cn(
                        "text-sm",
                        !modules.length && "text-slate-500 italic"
                    )}>
                        {!modules.length && t("noChapters")}
                        <div className="flex flex-col gap-y-2">
                            {modules.map((module) => (
                                <div key={module.id} className="flex items-center gap-x-2 bg-slate-100 border text-slate-700 rounded-md p-3">
                                    <div className="flex-1 truncate font-medium">
                                        {module.title}
                                    </div>
                                    <div className="ml-auto pr-2 flex items-center">
                                        <Badge className={cn(
                                            "bg-slate-500",
                                            module.isPublished && "bg-sky-700"
                                        )}>
                                            {module.isPublished ? t("published") : t("draft")}
                                        </Badge>
                                        <div onClick={() => router.push(`/pt-BR/teacher/courses/${courseId}/modules/${module.id}`)} className="cursor-pointer hover:underline text-sky-700 text-xs ml-4">
                                            {t("edit")}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
