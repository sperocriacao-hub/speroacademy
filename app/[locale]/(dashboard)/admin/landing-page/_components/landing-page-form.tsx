"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/file-upload";
import { useState } from "react";

interface LandingPageFormProps {
    initialData: any; // Using any for simplicity since properties were just added
}

const formSchema = z.object({
    heroTitle: z.string().min(1, { message: "O título é obrigatório" }),
    heroSubtitle: z.string().min(1, { message: "O subtítulo é obrigatório" }),
    heroImage: z.string().optional().nullable(),
});

export const LandingPageForm = ({ initialData }: LandingPageFormProps) => {
    const router = useRouter();
    const [isEditingImage, setIsEditingImage] = useState(false);

    const toggleEditImage = () => setIsEditingImage((current) => !current);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            heroTitle: initialData?.heroTitle || "",
            heroSubtitle: initialData?.heroSubtitle || "",
            heroImage: initialData?.heroImage || null,
        }
    });

    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.patch("/api/admin/settings", values);
            toast.success("Landing Page atualizada com sucesso!");
            router.refresh();
        } catch {
            toast.error("Algo deu errado ao atualizar as configurações.");
        }
    };

    const handleImageChange = async (url?: string) => {
        if (url) {
            form.setValue("heroImage", url, { shouldValidate: true, shouldDirty: true });
            await onSubmit(form.getValues());
            toggleEditImage();
        }
    }

    return (
        <div className="space-y-6 max-w-2xl bg-slate-100 p-6 rounded-md">

            <div className="bg-white p-4 rounded-md shadow-sm border space-y-4">
                <div className="font-medium flex items-center justify-between">
                    Imagem Principal (Hero)
                    <Button onClick={toggleEditImage} variant="ghost" size="sm">
                        {isEditingImage ? (
                            <>Cancelar</>
                        ) : (
                            <>{initialData?.heroImage ? "Editar Imagem" : "Adicionar Imagem"}</>
                        )}
                    </Button>
                </div>
                {!isEditingImage && (
                    !initialData?.heroImage ? (
                        <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
                            <ImageIcon className="h-10 w-10 text-slate-500" />
                        </div>
                    ) : (
                        <div className="relative aspect-video mt-2">
                            <Image
                                alt="Hero Image"
                                fill
                                className="object-cover rounded-md"
                                src={initialData.heroImage}
                            />
                        </div>
                    )
                )}
                {isEditingImage && (
                    <div>
                        <FileUpload
                            endpoint="courseImage" // Using courseImage endpoint as it accepts images
                            onChange={(url) => {
                                handleImageChange(url);
                            }}
                        />
                        <div className="text-xs text-muted-foreground mt-4">
                            Proporção 16:9 recomendada para a página principal.
                        </div>
                    </div>
                )}
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="heroTitle"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Título Principal</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={isSubmitting}
                                        placeholder="Ex: Domine Habilidades Essenciais..."
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="heroSubtitle"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subtítulo</FormLabel>
                                <FormControl>
                                    <Textarea
                                        disabled={isSubmitting}
                                        placeholder="Ex: Conectamos você aos melhores instrutores..."
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button disabled={!isValid || isSubmitting} type="submit">
                        Salvar Alterações
                    </Button>
                </form>
            </Form>
        </div>
    );
};
