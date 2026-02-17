import { db } from "@/lib/db";
import { Course, Transaction } from "@prisma/client";

type PurchaseWithCourse = Transaction & {
    course: Course;
};

const groupByCourse = (purchases: PurchaseWithCourse[]) => {
    const grouped: { [courseTitle: string]: number } = {};

    purchases.forEach((purchase) => {
        const courseTitle = purchase.course.title;
        if (!grouped[courseTitle]) {
            grouped[courseTitle] = 0;
        }
        grouped[courseTitle] += purchase.amount; // Use actual amount or instructorShare
    });

    return grouped;
};

export const getAnalytics = async (userId: string) => {
    try {
        const purchases = await db.transaction.findMany({
            where: {
                course: {
                    instructorId: userId,
                },
                status: "COMPLETED", // Ensure we only count completed transactions
            },
            include: {
                course: true,
            },
        });

        const groupedEarnings = groupByCourse(purchases);
        const data = Object.entries(groupedEarnings).map(([courseTitle, total]) => ({
            name: courseTitle,
            total: total,
        }));

        const totalRevenue = purchases.reduce((acc, purchase) => acc + (purchase.instructorShare || 0), 0);
        const totalSales = purchases.length;

        // Monthly Data for Chart (Group by Month)
        const monthlyData: { [key: string]: number } = {};
        purchases.forEach((purchase) => {
            const month = purchase.createdAt.toLocaleString('default', { month: 'short' });
            if (!monthlyData[month]) {
                monthlyData[month] = 0;
            }
            monthlyData[month] += purchase.instructorShare || 0;
        });

        const chartData = Object.entries(monthlyData).map(([name, total]) => ({
            name,
            total,
        }));

        return {
            data,
            totalRevenue,
            totalSales,
            chartData
        };
    } catch (error) {
        console.log("[GET_ANALYTICS]", error);
        return {
            data: [],
            totalRevenue: 0,
            totalSales: 0,
            chartData: []
        };
    }
};
