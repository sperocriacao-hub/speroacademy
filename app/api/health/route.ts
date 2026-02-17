import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        // 1. Check Database connection
        const categoryCount = await db.category.count();

        return NextResponse.json({
            status: "OK",
            database: "Connected",
            categories: categoryCount,
            env: process.env.NODE_ENV
        });
    } catch (error: any) {
        console.error("[HEALTH_CHECK_ERROR]", error);
        return NextResponse.json({
            status: "ERROR",
            database: "Failed",
            error: error.message
        }, { status: 500 });
    }
}
