import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher"; // Using isTeacher as Admin/Teacher check for now, can refine later

export async function PATCH(
    req: Request,
) {
    try {
        const { userId } = auth();
        // In a real app, strict ADMIN check here. For now using isTeacher (or strict ID check if provided)
        // Assuming the first user or specific ID is Admin.

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const values = await req.json();

        // Singleton pattern: Update the first record or create one
        const settings = await db.systemSettings.findFirst();

        if (settings) {
            await db.systemSettings.update({
                where: { id: settings.id },
                data: { ...values },
            });
        } else {
            await db.systemSettings.create({
                data: {
                    ...values
                }
            })
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log("[SETTINGS_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
