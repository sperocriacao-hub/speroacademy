"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "@prisma/client";

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: "email",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            const role = row.getValue("role") as string;
            return <Badge variant={role === "INSTRUCTOR" ? "default" : "secondary"}>{role}</Badge>
        }
    },
    {
        accessorKey: "stripeConnectId",
        header: "Stripe Connected",
        cell: ({ row }) => {
            const isConnected = !!row.getValue("stripeConnectId");
            return (
                <div className="flex items-center">
                    {isConnected ? (
                        <Badge className="bg-emerald-600"><Check className="h-3 w-3 mr-1" /> Connected</Badge>
                    ) : (
                        <Badge variant="outline" className="text-slate-500"><X className="h-3 w-3 mr-1" /> No</Badge>
                    )}
                </div>
            )
        }
    },
    {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt"));
            return <div>{date.toLocaleDateString()}</div>
        }
    }
]
