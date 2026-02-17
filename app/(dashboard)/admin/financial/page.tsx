import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { DollarSign, Landmark, CreditCard, Activity } from "lucide-react";

export default async function AdminFinancialPage() {
    const { userId } = auth();

    if (!userId) {
        return redirect("/");
    }

    // Check if user is admin (Simple check for now, can be role-based later)
    // const isAdmin = checkRole("admin"); 

    const transactions = await db.transaction.findMany({
        orderBy: {
            createdAt: "desc",
        },
        include: {
            user: true,
            course: true,
        },
        take: 50,
    });

    const totalRevenue = await db.transaction.aggregate({
        _sum: {
            amount: true,
        }
    });

    const platformRevenue = await db.transaction.aggregate({
        _sum: {
            platformShare: true,
        }
    });

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Financial Overview (Admin)</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">
                            Total Volume
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatPrice(totalRevenue._sum.amount || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Gross Transaction Volume
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">
                            Platform Revenue
                        </CardTitle>
                        <Landmark className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatPrice(platformRevenue._sum.platformShare || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Net Fees Collected
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">
                            Active Transactions
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {transactions.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Recent payments processed
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Platform Fee</TableHead>
                                <TableHead>Instructor Net</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell className="font-mono text-xs">{tx.id.slice(0, 8)}...</TableCell>
                                    <TableCell>{tx.user.name || tx.user.email}</TableCell>
                                    <TableCell>{tx.course.title}</TableCell>
                                    <TableCell>{formatPrice(tx.amount)}</TableCell>
                                    <TableCell className="text-green-600">+{formatPrice(tx.platformShare)}</TableCell>
                                    <TableCell>{formatPrice(tx.instructorShare)}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${tx.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {tx.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>{tx.createdAt.toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
