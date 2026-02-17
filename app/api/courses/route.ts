import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function POST(
    req: Request,
) {
    try {
        const { userId } = auth();
        const user = await currentUser();
        const { title } = await req.json();

        if (!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Ensure user exists in DB to satisfy foreign key
        const email = user.emailAddresses?.[0]?.emailAddress;
        if (email) {
            await db.user.upsert({
                where: { id: userId },
                create: {
                    id: userId,
                    email: email,
                    name: user.firstName ? `${user.firstName} ${user.lastName || ""}` : email,
                    role: "INSTRUCTOR", // Defaulting to instructor since they are creating a course
                },
                update: {
                    email: email, // Keep email in sync
                }
            });
        }

        const course = await db.course.create({
            data: {
                instructorId: userId,
                title,
            }
        });

        return NextResponse.json(course);
    } catch (error: any) {
        console.log("[COURSES]", error);
        return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
    }
}
