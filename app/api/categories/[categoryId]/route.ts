import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function DELETE(
    req: Request,
    { params }: { params: { categoryId: string } }
) {
    try {
        const adminSession = cookies().get("master_admin_session")?.value;
        if (adminSession !== "true") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const category = await db.category.delete({
            where: {
                id: params.categoryId,
            }
        });

        return NextResponse.json(category);
    } catch (error) {
        console.log("[CATEGORY_ID_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { categoryId: string } }
) {
    try {
        const adminSession = cookies().get("master_admin_session")?.value;
        if (adminSession !== "true") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const values = await req.json();

        const category = await db.category.update({
            where: {
                id: params.categoryId,
            },
            data: {
                ...values,
            }
        });

        return NextResponse.json(category);
    } catch (error) {
        console.log("[CATEGORY_ID_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
