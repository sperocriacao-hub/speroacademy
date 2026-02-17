import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET() {
    try {
        const { userId } = auth();
        const user = await currentUser();
        const headers = { 'Content-Type': 'application/json' };

        if (!userId || !user) {
            return new NextResponse(JSON.stringify({ error: "Unauthorized (Not logged in or User missing)" }), { status: 401, headers });
        }

        const report: any = { status: "STARTING_CHECKS", userId };

        // 0. Ensure User Exists (Lazy Sync)
        try {
            const email = user.emailAddresses?.[0]?.emailAddress;
            if (email) {
                await db.user.upsert({
                    where: { id: userId },
                    create: {
                        id: userId,
                        email: email,
                        name: user.firstName ? `${user.firstName} ${user.lastName || ""}` : email,
                        role: "INSTRUCTOR",
                    },
                    update: {
                        email: email,
                    }
                });
                report.userSync = "OK - Synced " + email;
            } else {
                report.userSync = "FAILED - No Email";
            }
        } catch (e: any) {
            report.userSync = `FAILED: ${e.message}`;
        }

        // 1. Test Category Fetch (Read)
        try {
            const categories = await db.category.findMany({ take: 1 });
            report.categories = "OK";
            report.categorySample = categories;
        } catch (e: any) {
            report.categories = `FAILED: ${e.message}`;
        }

        // 2. Test Course Fetch (Read Relations)
        try {
            const courses = await db.course.findMany({
                take: 1,
                include: {
                    category: true,
                    modules: true
                }
            });
            report.courses = "OK";
            report.courseSample = courses;
        } catch (e: any) {
            report.courses = `FAILED: ${e.message}`;
        }

        // 3. Test Course Creation (Write) - SIMULATION ONLY (Transaction rollback if possible, or create/delete)
        // We will attempt to create a dummy transaction to see if WRITES work.
        try {
            const testCourse = await db.course.create({
                data: {
                    title: "DEBUG_TEST_COURSE_" + Date.now(),
                    instructorId: userId,
                }
            });
            report.writeTest = "OK - Created " + testCourse.id;

            // Cleanup
            await db.course.delete({ where: { id: testCourse.id } });
            report.writeCleanup = "OK";

        } catch (e: any) {
            report.writeTest = `FAILED: ${e.message}`;
        }

        return new NextResponse(JSON.stringify(report, null, 2), { status: 200, headers });

    } catch (error: any) {
        return new NextResponse(JSON.stringify({
            status: "CRITICAL_FAILURE",
            error: error.message,
            stack: error.stack
        }), { status: 500 });
    }
}
