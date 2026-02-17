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
import { formatPrice } from "@/lib/format";

interface PriceFormProps {
    initialData: {
        price: number | null;
    };
    courseId: string;
}

const formSchema = z.object({
    price: z.coerce.number(),
});

export const PriceForm = ({
    initialData,
    courseId
}: PriceFormProps) => {
    const [isEditing, setIsEditing] = useState(false);

    const toggleEdit = () => setIsEditing((current) => !current);

    const router = useRouter();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = useForm<any>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            price: initialData.price || undefined,
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
                    Course price
                </CardTitle>
                <Button onClick={toggleEdit} variant="ghost" size="sm">
                    {isEditing ? (
                        <>Cancel</>
                    ) : (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                        </>
                    )}
                </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                {!isEditing && (
                    <p className={cn(
                        "text-sm",
                        !initialData.price && "text-slate-500 italic"
                    )}>
                        {initialData.price ? formatPrice(initialData.price) : "No price"}
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
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                disabled={isSubmitting}
                                                placeholder="Set a price for your course"
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
                                    Save
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </CardContent>
        </Card>
    )
}
