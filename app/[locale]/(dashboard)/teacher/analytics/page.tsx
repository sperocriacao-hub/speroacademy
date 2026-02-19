import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAnalytics } from "@/actions/get-analytics";
import { getInstructorStudents } from "@/actions/get-students";
import { DataCard } from "./_components/data-card";
import { Chart } from "./_components/chart";
import { StudentTable } from "./_components/student-table";
import { columns } from "./_components/student-columns";
import { DollarSign, Users, CreditCard } from "lucide-react";

export default async function AnalyticsPage() {
    const { userId } = auth();

    if (!userId) {
        return redirect("/");
    }

    const {
        data,
        totalRevenue,
        totalSales,
        chartData
    } = await getAnalytics(userId);

    const students = await getInstructorStudents(userId);

    return (
        <div className="p-6">
            <div className="flex flex-col gap-y-4 mb-4">
                <h1 className="text-2xl font-bold">
                    Analytics Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                    Overview of your courses, earnings and students.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <DataCard
                    label="Total Revenue"
                    value={totalRevenue}
                    shouldFormat
                    icon={DollarSign}
                />
                <DataCard
                    label="Total Sales"
                    value={totalSales}
                    icon={CreditCard}
                />
                <DataCard
                    label="Total Students"
                    value={students.length}
                    icon={Users}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                <div className="p-4 border rounded-md shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Monthly Revenue</h2>
                    <Chart data={chartData} />
                </div>
                <div className="p-4 border rounded-md shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Revenue by Course</h2>
                    <Chart data={data} />
                </div>
            </div>

            <div className="p-4 border rounded-md shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Recent Students</h2>
                <StudentTable columns={columns} data={students} />
            </div>
        </div>
    );
}

