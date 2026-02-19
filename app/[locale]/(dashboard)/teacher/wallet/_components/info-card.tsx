import { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InfoCardProps {
    numberOfItems: number;
    variant?: "default" | "success";
    label: string;
    icon: LucideIcon;
}

export const InfoCard = ({
    variant,
    icon: Icon,
    numberOfItems,
    label,
}: InfoCardProps) => {
    return (
        <Card className="border-0 shadow-sm p-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {variant === "success" ? (
                        new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "BRL"
                        }).format(numberOfItems)
                    ) : (
                        numberOfItems
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
