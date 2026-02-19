import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function POST(
    req: Request,
    { params }: { params: { courseId: string } }
) {
    try {
        const { userId } = auth();
        const { courseId } = params;
        const { url } = await req.json();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const courseOwner = await db.course.findUnique({
            where: {
                id: courseId,
                instructorId: userId,
            }
        });

        if (!courseOwner) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Generate a name from the URL if not provided
        const name = url.split('/').pop() || "Attachment";

        const attachment = await db.attachment.create({
            data: {
                url,
                name,
                courseId,
            }
        });

        return NextResponse.json(attachment);
    } catch (error) {
        console.log("[COURSE_ID_ATTACHMENTS]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
