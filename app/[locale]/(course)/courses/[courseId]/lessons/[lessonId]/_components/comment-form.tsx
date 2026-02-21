"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { SendHorizontal } from "lucide-react";
import toast from "react-hot-toast";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CommentFormProps {
    courseId: string;
    lessonId: string;
}

const formSchema = z.object({
    text: z.string().min(1, {
        message: "O comentário não pode estar vazio.",
    }),
});

export const CommentForm = ({
    courseId,
    lessonId,
}: CommentFormProps) => {
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            text: "",
        },
    });

    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.post(`/api/courses/${courseId}/lessons/${lessonId}/comments`, values);
            toast.success("Comentário enviado");
            form.reset();
            router.refresh();
        } catch {
            toast.error("Ocorreu um erro ao enviar o comentário");
        }
    }

    return (
        <div className="mt-4">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex items-center gap-x-2 w-full"
                >
                    <FormField
                        control={form.control}
                        name="text"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormControl>
                                    <Input
                                        disabled={isSubmitting}
                                        placeholder="Tem alguma dúvida construtiva? Adicione aqui..."
                                        className="bg-slate-900 border-slate-700 text-slate-200 focus-visible:ring-sky-500"
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
                        className="bg-sky-600 hover:bg-sky-700"
                    >
                        <SendHorizontal className="h-4 w-4" />
                    </Button>
                </form>
            </Form>
        </div>
    )
}
