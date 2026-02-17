import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import { LucideIcon } from "lucide-react";

interface DataCardProps {
    value: number;
    label: string;
    shouldFormat?: boolean;
    icon?: LucideIcon
}

export const DataCard = ({
    value,
    label,
    shouldFormat,
    icon: Icon
}: DataCardProps) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {label}
                </CardTitle>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {shouldFormat ? formatPrice(value) : value}
                </div>
            </CardContent>
        </Card>
    )
}
