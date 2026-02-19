"use client";

import { Course } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, MoreHorizontal, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";

export const columns: ColumnDef<Course>[] = [
    {
        accessorKey: "title",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "price",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("price") || "0");
            const formatted = formatPrice(price);

            return <div>{formatted}</div>
        }
    },
    {
        accessorKey: "isPublished",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Published
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const isPublished = row.getValue("isPublished") || false;

            return (
                <Badge className={cn(
                    "bg-slate-500",
                    isPublished && "bg-sky-700"
                )}>
                    {isPublished ? "Published" : "Draft"}
                </Badge>
            )
        }
    },
    {
        accessorKey: "isApproved",
        header: "Status",
        cell: ({ row }) => {
            const isApproved = row.getValue("isApproved") || false;
            const isPublished = row.original.isPublished;

            return (
                <div className="flex flex-col gap-1">
                    <Badge className={cn(
                        "bg-slate-500 w-fit",
                        isPublished && "bg-sky-700"
                    )}>
                        {isPublished ? "Published" : "Draft"}
                    </Badge>
                    <Badge variant={isApproved ? "default" : "destructive"} className="w-fit">
                        {isApproved ? "Approved" : "Pending"}
                    </Badge>
                </div>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const { id } = row.original;
            const isApproved = (row.original as any).isApproved;
            const router = useRouter();
            const [isLoading, setIsLoading] = useState(false);

            const onApprove = async () => {
                try {
                    setIsLoading(true);
                    await axios.post(`/api/courses/${id}/approve`);
                    toast.success("Course approved");
                    router.refresh();
                } catch {
                    toast.error("Something went wrong");
                } finally {
                    setIsLoading(false);
                }
            }

            const onReject = async () => {
                try {
                    setIsLoading(true);
                    await axios.post(`/api/courses/${id}/unapprove`);
                    toast.success("Course unapproved");
                    router.refresh();
                } catch {
                    toast.error("Something went wrong");
                } finally {
                    setIsLoading(false);
                }
            }

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <Link href={`/teacher/courses/${id}`}>
                            <DropdownMenuItem>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                        </Link>
                        {isApproved ? (
                            <DropdownMenuItem onClick={onReject} disabled={isLoading}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject / Unapprove
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onClick={onApprove} disabled={isLoading}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]
