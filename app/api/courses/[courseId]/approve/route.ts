import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function POST(
    req: Request,
    { params }: { params: { courseId: string } }
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // In a real app, check if user is admin
        // if (!isAdmin(userId)) return new NextResponse("Unauthorized", { status: 401 });

        const course = await db.course.update({
            where: {
                id: params.courseId,
            },
            data: {
                isApproved: true,
            }
        });

        return NextResponse.json(course);
    } catch (error) {
        console.log("[COURSE_ID_APPROVE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
