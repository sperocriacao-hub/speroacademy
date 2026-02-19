"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { SystemSettings } from "@prisma/client";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SettingsFormProps {
    initialData: SystemSettings | null;
}

const formSchema = z.object({
    platformFeePercent: z.coerce.number().min(0).max(100),
});

export const SettingsForm = ({
    initialData
}: SettingsFormProps) => {
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        // @ts-expect-error - Zod coercion to number causes strict TS inference mismatch 
        resolver: zodResolver(formSchema),
        defaultValues: {
            platformFeePercent: initialData?.platformFeePercent ? Number(initialData.platformFeePercent) : 10,
        },
    });

    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.patch(`/api/admin/settings`, values); // Single endpoint for settings
            toast.success("Settings updated");
            router.refresh();
        } catch {
            toast.error("Something went wrong");
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>
                    Adjust global configurations for the platform.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
                        <FormField
                            // @ts-expect-error - Hook form has strict generics conflict with Zod coerced number
                            control={form.control}
                            name="platformFeePercent"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Platform Fee (%)</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isSubmitting}
                                            type="number"
                                            step="0.1"
                                            placeholder="e.g. 10.0"
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        The percentage taken from each course sale as platform commission.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-center gap-x-2">
                            <Button
                                disabled={!isValid || isSubmitting}
                                type="submit"
                            >
                                Save changes
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
