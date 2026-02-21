"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Question, Quiz } from "@prisma/client";

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

interface QuestionsFormProps {
    initialData: Quiz & { questions: Question[] };
    courseId: string;
    moduleId: string;
    quizId: string;
}

const formSchema = z.object({
    prompt: z.string().min(1, { message: "A pergunta é obrigatória" }),
});

export const QuestionsForm = ({
    initialData,
    courseId,
    moduleId,
    quizId,
}: QuestionsFormProps) => {
    const [isCreating, setIsCreating] = useState(false);

    const toggleCreating = () => setIsCreating((current) => !current);

    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: "",
        },
    });

    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.post(`/api/courses/${courseId}/modules/${moduleId}/quiz/questions`, values);
            toast.success("Pergunta criada");
            toggleCreating();
            form.reset();
            router.refresh();
        } catch {
            toast.error("Algo deu errado");
        }
    }

    const onEdit = (id: string) => {
        router.push(`/teacher/courses/${courseId}/modules/${moduleId}/quiz/questions/${id}`);
    }

    const questions = initialData.questions || [];

    return (
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                Perguntas da Prova
                <Button onClick={toggleCreating} variant="ghost">
                    {isCreating ? (
                        <>Cancelar</>
                    ) : (
                        <>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Adicionar pergunta
                        </>
                    )}
                </Button>
            </div>

            {isCreating && (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4 mt-4"
                    >
                        <FormField
                            control={form.control}
                            name="prompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            disabled={isSubmitting}
                                            placeholder="Ex: 'Qual a principal vantagem de...'"
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
                            Criar
                        </Button>
                    </form>
                </Form>
            )}
            {!isCreating && (
                <div className={cn(
                    "text-sm mt-2",
                    !questions.length && "text-slate-500 italic"
                )}>
                    {!questions.length && "Nenhuma pergunta adicionada."}
                    <div className="flex flex-col gap-y-2 mt-2">
                        {questions.map((question) => (
                            <div
                                key={question.id}
                                onClick={() => onEdit(question.id)}
                                className="flex items-center gap-x-2 bg-slate-200 border-slate-200 border text-slate-700 rounded-md hover:bg-slate-300 transition mb-2 text-sm p-3 cursor-pointer"
                            >
                                <span className="font-semibold">{question.position}.</span>
                                <span className="truncate">{question.prompt}</span>
                                <span className="text-xs text-muted-foreground ml-auto">Editar</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
