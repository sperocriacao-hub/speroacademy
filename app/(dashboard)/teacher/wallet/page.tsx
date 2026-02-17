import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CircleDollarSign, List } from "lucide-react";

import { db } from "@/lib/db";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { InfoCard } from "./_components/info-card";

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

    const totalTransactions = transactions.length;
    const currentBalance = wallet?.balance || 0;

    return (
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <InfoCard
                    icon={CircleDollarSign}
                    label="Available Balance"
                    numberOfItems={currentBalance}
                    variant="success"
                />
                <InfoCard
                    icon={List}
                    label="Total Transactions"
                    numberOfItems={totalTransactions}
                />
            </div>
            <div className="mt-6">
                <h2 className="text-xl font-medium mb-4">Transaction History</h2>
                <DataTable columns={columns} data={transactions} />
            </div>
        </div>
    );
}
