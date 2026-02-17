import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CircleDollarSign, List, TrendingUp, Wallet } from "lucide-react";

import { db } from "@/lib/db";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { InfoCard } from "./_components/info-card";
import { Button } from "@/components/ui/button";
import { convertCurrency } from "@/lib/finance/exchange";
import { formatPrice } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function WalletPage() {
    const { userId } = auth();

    if (!userId) {
        return redirect("/");
    }

    const wallet = await db.wallet.findUnique({
        where: {
            instructorId: userId,
        }
    });

    const transactions = await db.transaction.findMany({
        where: {
            instructorId: userId,
        },
        include: {
            course: true,
        },
        orderBy: {
            createdAt: "desc",
        }
    });

    const currentBalance = wallet?.balance || 0;

    // Calculate Total Revenue (Instructor Share of all transactions)
    const totalRevenue = transactions.reduce((acc, curr) => acc + curr.instructorShare, 0);

    // Calculate Month Sales
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthTransactions = transactions.filter(t => {
        const date = new Date(t.createdAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    const monthSales = monthTransactions.reduce((acc, curr) => acc + curr.instructorShare, 0);

    // Convert to EUR for display (assuming Instructor is accessing from PT as per prompt)
    let currentBalanceEur = currentBalance;
    let totalRevenueEur = totalRevenue;
    let monthSalesEur = monthSales;

    try {
        currentBalanceEur = await convertCurrency(currentBalance, "BRL", "EUR");
        totalRevenueEur = await convertCurrency(totalRevenue, "BRL", "EUR");
        monthSalesEur = await convertCurrency(monthSales, "BRL", "EUR");
    } catch (error) {
        console.error("Currency conversion failed:", error);
        // Fallback to original values (BRL) or 0? 
        // We keep original values but since they are BRL, displaying them as EUR would be wrong.
        // Let's rely on convertCurrency internal fallback which returns original amount.
    }

    const canWithdraw = currentBalanceEur >= 50;

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Financial Statement</h1>
                <Button disabled={!canWithdraw} variant={canWithdraw ? "default" : "secondary"}>
                    Request Withdrawal ({formatPrice(currentBalanceEur, { currency: "EUR" })})
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatPrice(totalRevenueEur, { currency: "EUR" })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Lifetime earnings
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Available Balance
                        </CardTitle>
                        <Wallet className="h-4 w-4 text-sky-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatPrice(currentBalanceEur, { currency: "EUR" })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {formatPrice(currentBalance)} (BRL)
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Month Sales
                        </CardTitle>
                        <CircleDollarSign className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatPrice(monthSalesEur, { currency: "EUR" })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {monthTransactions.length} transactions this month
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6">
                <h2 className="text-xl font-medium mb-4">Transaction History</h2>
                <DataTable columns={columns} data={transactions} />
            </div>
        </div>
    );
}
