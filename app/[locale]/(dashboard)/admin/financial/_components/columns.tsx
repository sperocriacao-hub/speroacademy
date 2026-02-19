"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
        accessorKey: "course.title",
        header: "Course",
        cell: ({ row }) => {
            // @ts-ignore
            return <div>{row.original.course?.title || "Unknown"}</div>
        }
    },
    {
        accessorKey: "amount",
        header: "Total",
        cell: ({ row }) => {
            return <div>{formatPrice(row.getValue("amount"))}</div>
        }
    },
    {
        accessorKey: "platformShare",
        header: "Fee",
        cell: ({ row }) => {
            return <div className="text-emerald-600 font-medium">{formatPrice(row.getValue("platformShare"))}</div>
        }
    },
    {
        accessorKey: "instructorShare",
        header: "Net",
        cell: ({ row }) => {
            return <div>{formatPrice(row.getValue("instructorShare"))}</div>
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            return <Badge>{row.getValue("status")}</Badge>
        }
    },
]
