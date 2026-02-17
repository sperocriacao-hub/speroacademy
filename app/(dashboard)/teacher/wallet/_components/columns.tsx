"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Transaction } from "@prisma/client";
import { formatPrice } from "@/lib/format";

export const columns: ColumnDef<Transaction>[] = [
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt"));
            return <div>{date.toLocaleDateString()}</div>
        }
    },
    {
        accessorKey: "course.title", // Logic needs to handle relation fetching? Yes if using include
        header: "Course",
        cell: ({ row }) => {
            // @ts-ignore
            return <div>{row.original.course?.title || "Unknown Course"}</div>
        }
    },
    {
        accessorKey: "paymentMethod",
        header: "Method",
        cell: ({ row }) => {
            return <Badge variant="outline">{row.getValue("paymentMethod")}</Badge>
        }
    },
    {
        accessorKey: "instructorShare",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Net Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("instructorShare") || "0");
            const formatted = formatPrice(price);

            return <div className="font-bold text-emerald-600">{formatted}</div>
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status: string = row.getValue("status");
            return (
                <Badge className={cn(
                    "bg-slate-500",
                    status === "COMPLETED" && "bg-emerald-600 hover:bg-emerald-600",
                    status === "REFUNDED" && "bg-rose-600 hover:bg-rose-600",
                    status === "PENDING" && "bg-yellow-600 hover:bg-yellow-600",
                )}>
                    {status === "COMPLETED" ? "Paid" : status}
                </Badge>
            )
        }
    },
]
