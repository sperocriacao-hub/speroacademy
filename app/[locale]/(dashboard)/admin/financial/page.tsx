import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CircleDollarSign, CreditCard, DollarSign } from "lucide-react";

import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";

const AdminFinancialPage = async () => {
    // Skipped Clerk auth explicitly since `/admin` relies on cookies

    const transactions = await db.transaction.findMany({
        orderBy: {
            createdAt: "desc",
        },
        include: {
            course: true,
            user: true, // Student
        }
    });

    // Calculates
    const totalVolume = transactions.reduce((acc, curr) => acc + curr.amount, 0);
    const totalPlatformFees = transactions.reduce((acc, curr) => acc + curr.platformShare, 0);
    const totalInstructorPayouts = transactions.reduce((acc, curr) => acc + curr.instructorShare, 0);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Financial Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Volume
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatPrice(totalVolume)}</div>
                        <p className="text-xs text-muted-foreground">
                            Gross Transaction Volume (GTV)
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Platform Revenue
                        </CardTitle>
                        <CircleDollarSign className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatPrice(totalPlatformFees)}</div>
                        <p className="text-xs text-muted-foreground">
                            Net platform fees collected
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Instructor Payouts
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatPrice(totalInstructorPayouts)}</div>
                        <p className="text-xs text-muted-foreground">
                            Total distributed to instructors
                        </p>
                    </CardContent>
                </Card>
            </div>

            <h2 className="text-xl font-medium mb-4">All Transactions</h2>
            <DataTable columns={columns} data={transactions} />
        </div>
    );
}

export default AdminFinancialPage;
